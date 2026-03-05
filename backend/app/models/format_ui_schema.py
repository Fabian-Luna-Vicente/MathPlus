from pydantic import BaseModel, Field
from typing import List, Literal, Optional

class PasoAnimacion(BaseModel):
    texto_voz: str = Field(description="Texto narrativo para el audio")
    latex_visible: str = Field(description="Fórmula LaTeX a mostrar")
    elementos_foco: List[str] = Field(description="IDs de elementos a resaltar")
    accion_dom: Literal['aparecer', 'mover', 'resaltar', 'desaparecer', 'ninguna']

class TgElement(BaseModel):
    tg: str
    ac: str
    color: Optional[str] = None

class InstElement(BaseModel):
    msg: str
    tgs: List[TgElement]
    fin: Optional[List[int] ]= None

class ContElement(BaseModel):
    type: str
    cont: Optional[str] = None
    x: float
    y: float
    toX: Optional[float] = None
    toY: Optional[float] = None
    apart: Optional[str] = None
    status: str

class ResourceElement(BaseModel):
    step: list[int]
    title: str
    tex: str

class Escena(BaseModel):
    ig: str
    cont: List[ContElement]
    resources: Optional[List[ResourceElement]] = None
    insts: List[InstElement]

class SolucionMath(BaseModel):
    escenas: List[Escena]