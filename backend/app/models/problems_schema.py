from pydantic import BaseModel, Field
from typing import List, Optional

class UserRequest(BaseModel):
    query: str
    file_content: Optional[str] = None # Para contenido de PDF parseado

class ExplainRequest(BaseModel):
    step_index: int
    before_tex: str  # La ecuación antes del paso
    after_tex: str   # La ecuación después del paso
    context: str
    
class DetectedProblemsResponse(BaseModel):
    problems: List[str]
    
class ProblemList(BaseModel):
    problems: List[str] = Field(description="Lista de los enunciados de los problemas matemáticos extraídos.")
   
   