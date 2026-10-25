from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# ⚠️ REEMPLAZA [TU-PASSWORD] con la contraseña de tu base de datos en Supabase
# Puedes obtener la URI completa en Supabase: Project Settings > Database > Connection string > URI
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:sldozelada2021@db.denucazhwpubkylktwkp.supabase.co:5432/postgres"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()