from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# --- Esquemas de Autenticación y Tokens ---
class UsuarioLogin(BaseModel):
    nombre_usuario: str
    contrasena: str

class Token(BaseModel):
    access_token: str
    token_type: str
    rol: Optional[str] = None
    nombre_completo: Optional[str] = None

class TokenData(BaseModel):
    nombre_usuario: Optional[str] = None


# --- Esquemas para Roles ---
class RolBase(BaseModel):
    nombre_rol: str
    descripcion: Optional[str] = None

class RolCreate(RolBase):
    pass

class RolResponse(RolBase):
    id_rol: int

    model_config = ConfigDict(from_attributes=True)


# --- Esquemas para Usuarios ---
class UsuarioBase(BaseModel):
    id_rol: int
    nombre: str
    apellido: str
    nombre_usuario: str
    estado: Optional[str] = "Activo"

class UsuarioCreate(UsuarioBase):
    contrasena: str

    @field_validator('contrasena')
    @classmethod
    def recortar_contrasena(cls, v: str) -> str:
        # Si la contraseña supera los 72 caracteres, la recorta automáticamente para bcrypt
        if v and len(v) > 72:
            return v[:72]
        return v

class UsuarioResponse(UsuarioBase):
    id_usuario: int
    rol: Optional[RolResponse] = None

    model_config = ConfigDict(from_attributes=True)


# --- Esquemas para Líneas ---
class LineaBase(BaseModel):
    numero_linea: int
    estado: Optional[str] = "Disponible"

class LineaCreate(LineaBase):
    pass

class LineaResponse(LineaBase):
    id_linea: int

    model_config = ConfigDict(from_attributes=True)


# --- Esquemas para Motorizados ---
class MotorizadoBase(BaseModel):
    tipo_motorizado: str  # Motocicleta, Torito, Motocar
    placa: str
    marca: str
    color: str
    modelo: str

class MotorizadoCreate(MotorizadoBase):
    pass

class MotorizadoResponse(MotorizadoBase):
    id_motorizado: int
    id_interno: int

    model_config = ConfigDict(from_attributes=True)


# --- Esquemas para Internos ---
class InternoBase(BaseModel):
    id_linea: Optional[int] = None
    nombre: str
    apellido: str
    ci: str
    telefono: Optional[str] = None
    tipo_interno: str  # Socio o Inquilino
    estado: Optional[str] = "Activo"

class InternoCreate(InternoBase):
    pass

class InternoResponse(InternoBase):
    id_interno: int
    motorizados: List[MotorizadoResponse] = []

    model_config = ConfigDict(from_attributes=True)


# --- Esquemas para Pagos y Caja ---
class PagoBase(BaseModel):
    id_interno: Optional[int] = None
    id_usuario: int
    concepto: str  # Mensualidad, Multa, Cuota, Egreso General
    monto: float
    tipo_movimiento: str  # Ingreso o Egreso

class PagoCreate(PagoBase):
    pass

class PagoResponse(PagoBase):
    id_pago: int
    fecha_pago: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)