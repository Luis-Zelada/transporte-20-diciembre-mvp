import bcrypt
from datetime import datetime, timedelta
from jose import jwt  # Asegúrate de tener la importación correcta para los tokens

SECRET_KEY = "tu_clave_secreta_super_segura_aqui"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def obtener_password_hash(password: str):
    # Blindaje estricto de bytes para bcrypt
    password_seguro = str(password)[:72].encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_seguro, salt).decode('utf-8')

def verificar_password(password_plano: str, password_hash: str):
    password_seguro = str(password_plano)[:72].encode('utf-8')
    return bcrypt.checkpw(password_seguro, password_hash.encode('utf-8'))

def crear_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt