from pydantic import BaseModel, Field
from typing import List, Optional

class UserRequest(BaseModel):
    query: str
    file_content: Optional[str] = None # Para contenido de PDF parseado

class ExplainRequest(BaseModel):
    step_index: int
    before_tex: str  # La ecuación antes del paso
    after_tex: Optional[str] = None  # La ecuación después del paso (opcional si es isolated)
    context: str
    mode: Optional[str] = "transition" # 'isolated' o 'transition'
    
class DetectedProblemsResponse(BaseModel):
    problems: List[str]
    
class ProblemList(BaseModel):
    problems: List[str] = Field(description="Lista de los enunciados de los problemas matemáticos extraídos.")
   
   