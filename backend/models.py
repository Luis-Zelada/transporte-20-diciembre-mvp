from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Rol(Base):
    __tablename__ = "rol"
    id_rol = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_rol = Column(String(50), unique=True, nullable=False)
    descripcion = Column(Text)

    # Relación inversa hacia usuarios
    usuarios = relationship("Usuario", back_populates="rol")

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    nombre_usuario = Column(String, unique=True, index=True, nullable=False)
    contrasena = Column(String(255), nullable=False)  # <-- Asegúrate de que sea 255 o Text, nunca un límite bajo
    id_rol = Column(Integer, ForeignKey("rol.id_rol"), nullable=False)
    estado = Column(String, default="Activo")

    # Relación hacia el rol
    rol = relationship("Rol", back_populates="usuarios")

class Linea(Base):
    __tablename__ = "lineas"
    id_linea = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numero_linea = Column(Integer, unique=True, nullable=False)
    estado = Column(String(20), default="Disponible")

    # Relación: una línea puede tener varios internos registrados
    internos = relationship("Interno", back_populates="linea", cascade="all, delete-orphan")


class Interno(Base):
    __tablename__ = "internos"
    id_interno = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_linea = Column(Integer, ForeignKey("lineas.id_linea"), nullable=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    ci = Column(String(30), unique=True, nullable=False)
    telefono = Column(String(20))
    tipo_interno = Column(String(20), nullable=False) # Socio o Inquilino
    estado = Column(String(20), default="Activo")

    # Relaciones
    linea = relationship("Linea", back_populates="internos")
    motorizados = relationship("Motorizado", back_populates="interno", cascade="all, delete-orphan")


class Motorizado(Base):
    __tablename__ = "motorizados"
    id_motorizado = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_interno = Column(Integer, ForeignKey("internos.id_interno"), nullable=False)
    tipo_motorizado = Column(String(30), nullable=False) # Motocicleta, Torito, Motocar
    placa = Column(String(20), unique=True, nullable=False)
    marca = Column(String(50), nullable=False)
    color = Column(String(30), nullable=False)
    modelo = Column(String(20), nullable=False)

    # Relación: un motorizado pertenece a un único interno
    interno = relationship("Interno", back_populates="motorizados")

class PagosYCaja(Base):
    __tablename__ = "pagos_y_caja"
    id_pago = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_interno = Column(Integer, ForeignKey("internos.id_interno"), nullable=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    concepto = Column(String(50), nullable=False) # Mensualidad, Multa, Cuota, Egreso General
    monto = Column(Numeric(10, 2), nullable=False)
    tipo_movimiento = Column(String(20), nullable=False) # Ingreso o Egreso
    fecha_pago = Column(DateTime(timezone=True), server_default=func.now())