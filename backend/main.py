from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
from decimal import Decimal
from fastapi.middleware.cors import CORSMiddleware
import models
import schemas
import auth
from database import engine, get_db

# 1. Instanciar la aplicación FastAPI UNA SOLA VEZ al inicio
app = FastAPI(
    title="API Asociación de Transporte 20 de Diciembre",
    version="1.0.0",
    description="Backend oficial del MVP de gestión para la asociación con autenticación JWT."
)


# 2. Configurar CORS abierto para desarrollo local sin bloqueos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Crear las tablas en la base de datos si no existieran
models.Base.metadata.create_all(bind=engine)


@app.get("/")
def read_root():
    return {"mensaje": "¡Bienvenido al Backend de la Asociación de Transporte 20 de Diciembre!"}


# ==================== ENDPOINTS DE LÍNEAS ====================

@app.post("/api/v1/lineas", response_model=schemas.LineaResponse)
def crear_linea(linea: schemas.LineaCreate, db: Session = Depends(get_db)):
    db_linea = models.Linea(
        numero_linea=linea.numero_linea,
        estado=linea.estado
    )
    db.add(db_linea)
    db.commit()
    db.refresh(db_linea)
    return db_linea

@app.get("/api/v1/lineas", response_model=List[schemas.LineaResponse])
def listar_lineas(db: Session = Depends(get_db)):
    lineas = db.query(models.Linea).all()
    return lineas

@app.delete("/api/v1/lineas/{id_linea}")
def eliminar_linea(id_linea: int, db: Session = Depends(get_db)):
    db_linea = db.query(models.Linea).filter(models.Linea.id_linea == id_linea).first()
    if not db_linea:
        raise HTTPException(status_code=404, detail="Línea no encontrada")
    db.delete(db_linea)
    db.commit()
    return {"mensaje": "Línea eliminada exitosamente"}

@app.put("/api/v1/lineas/{id_linea}", response_model=schemas.LineaResponse)
def actualizar_linea(id_linea: int, linea_data: schemas.LineaCreate, db: Session = Depends(get_db)):
    db_linea = db.query(models.Linea).filter(models.Linea.id_linea == id_linea).first()
    if not db_linea:
        raise HTTPException(status_code=404, detail="Línea no encontrada")
    
    db_linea.numero_linea = linea_data.numero_linea
    db_linea.estado = linea_data.estado
    db.commit()
    db.refresh(db_linea)
    return db_linea


# ==================== ENDPOINTS DE ROLES Y USUARIOS ====================

@app.get("/api/v1/roles", response_model=list[schemas.RolResponse])
def listar_roles(db: Session = Depends(get_db)):
    return db.query(models.Rol).all()

@app.get("/api/v1/usuarios", response_model=list[schemas.UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).all()

@app.post("/api/v1/usuarios", response_model=schemas.UsuarioResponse)
def crear_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    try:
        # Verificar si el nombre de usuario ya existe
        db_usuario = db.query(models.Usuario).filter(models.Usuario.nombre_usuario == usuario.nombre_usuario).first()
        if db_usuario:
            raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")
        
        # AQUÍ ESTÁ LA CLAVE: Llamamos a auth.py para que use bcrypt puro sin passlib
        hashed_password = auth.obtener_password_hash(usuario.contrasena)
        
        nuevo_usuario = models.Usuario(
            nombre=usuario.nombre,
            apellido=usuario.apellido,
            nombre_usuario=usuario.nombre_usuario,
            contrasena=hashed_password,
            id_rol=usuario.id_rol,
            estado=usuario.estado
        )
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)
        return nuevo_usuario
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error interno: {str(e)}")

# ==================== ENDPOINTS DE AUTENTICACIÓN ====================

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.nombre_usuario == form_data.username).first()
    if not usuario or not auth.verificar_password(form_data.password, usuario.contrasena):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    
    access_token = auth.crear_access_token(data={"sub": usuario.nombre_usuario})
    
    # Buscamos el rol asociado en la base de datos
    rol_obj = db.query(models.Rol).filter(models.Rol.id_rol == usuario.id_rol).first()
    nombre_rol = rol_obj.nombre_rol if rol_obj else "Administrador"

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "rol": nombre_rol, 
        "nombre_completo": f"{usuario.nombre} {usuario.apellido}"
    }

@app.post("/api/v1/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.nombre_usuario == form_data.username).first()
    
    if not usuario or not auth.verificar_password(form_data.password, usuario.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.crear_access_token(
        data={"sub": usuario.nombre_usuario}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# ==================== ENDPOINTS DE INTERNOS ====================

@app.get("/api/v1/internos", response_model=list[schemas.InternoResponse])
def listar_internos(db: Session = Depends(get_db)):
    return db.query(models.Interno).all()

@app.post("/api/v1/internos", response_model=schemas.InternoResponse)
def crear_interno(interno: schemas.InternoCreate, db: Session = Depends(get_db)):
    db_interno = db.query(models.Interno).filter(models.Interno.ci == interno.ci).first()
    if db_interno:
        raise HTTPException(status_code=400, detail="Ya existe un interno registrado con este número de CI")
    
    nuevo_interno = models.Interno(**interno.dict())
    db.add(nuevo_interno)
    db.commit()
    db.refresh(nuevo_interno)
    return nuevo_interno

@app.delete("/api/v1/internos/{id_interno}")
def eliminar_interno(id_interno: int, db: Session = Depends(get_db)):
    db_interno = db.query(models.Interno).filter(models.Interno.id_interno == id_interno).first()
    if not db_interno:
        raise HTTPException(status_code=404, detail="Interno no encontrado")
    db.delete(db_interno)
    db.commit()
    return {"mensaje": "Interno eliminado exitosamente"}


# ==================== ENDPOINTS DE MOTORIZADOS ====================

@app.get("/api/v1/motorizados", response_model=list[schemas.MotorizadoResponse])
def listar_motorizados(db: Session = Depends(get_db)):
    return db.query(models.Motorizado).all()

@app.post("/api/v1/motorizados", response_model=schemas.MotorizadoResponse)
def crear_motorizado(motorizado: schemas.MotorizadoCreate, id_interno: int, db: Session = Depends(get_db)):
    interno = db.query(models.Interno).filter(models.Interno.id_interno == id_interno).first()
    if not interno:
        raise HTTPException(status_code=404, detail="El interno propietario no existe")
    
    placa_existente = db.query(models.Motorizado).filter(models.Motorizado.placa == motorizado.placa).first()
    if placa_existente:
        raise HTTPException(status_code=400, detail="La placa del motorizado ya se encuentra registrada")

    nuevo_motorizado = models.Motorizado(**motorizado.dict(), id_interno=id_interno)
    db.add(nuevo_motorizado)
    db.commit()
    db.refresh(nuevo_motorizado)
    return nuevo_motorizado

@app.delete("/api/v1/motorizados/{id_motorizado}")
def eliminar_motorizado(id_motorizado: int, db: Session = Depends(get_db)):
    db_motorizado = db.query(models.Motorizado).filter(models.Motorizado.id_motorizado == id_motorizado).first()
    if not db_motorizado:
        raise HTTPException(status_code=404, detail="Motorizado no encontrado")
    db.delete(db_motorizado)
    db.commit()
    return {"mensaje": "Motorizado eliminado exitosamente"}


# ==================== ENDPOINTS DE FINANZAS / CAJA ====================

@app.get("/api/v1/pagos", response_model=list[schemas.PagoResponse])
def listar_pagos(db: Session = Depends(get_db)):
    return db.query(models.PagosYCaja).all()

@app.post("/api/v1/pagos", response_model=schemas.PagoResponse)
def registrar_pago(pago: schemas.PagoCreate, db: Session = Depends(get_db)):
    nuevo_pago = models.PagosYCaja(**pago.dict())
    db.add(nuevo_pago)
    db.commit()
    db.refresh(nuevo_pago)
    return nuevo_pago

@app.get("/api/v1/caja/resumen")
def resumen_caja(db: Session = Depends(get_db)):
    movimientos = db.query(models.PagosYCaja).all()
    total_ingresos = sum(m.monto for m in movimientos if m.tipo_movimiento == "Ingreso")
    total_egresos = sum(m.monto for m in movimientos if m.tipo_movimiento == "Egreso")
    saldo_actual = total_ingresos - total_egresos
    
    return {
        "total_ingresos": float(total_ingresos),
        "total_egresos": float(total_egresos),
        "saldo_actual": float(saldo_actual)
    }