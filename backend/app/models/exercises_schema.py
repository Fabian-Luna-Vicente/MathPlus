from pydantic import BaseModel
from typing import  Optional


class ExerciseCreate(BaseModel):
    titulo: str
    contenido_json: str
    tags: str
    fecha: str

class ExerciseUpdate(BaseModel):
    titulo: Optional[str] = None
    contenido_json: Optional[str] = None
    tags: Optional[str] = None