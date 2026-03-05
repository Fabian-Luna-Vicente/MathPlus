from pydantic import BaseModel, Field
from typing import Optional, TypedDict


class api_keys(BaseModel):
    gemini: Optional[str] = Field(None, description="API Key para Google Gemini")
    groq: Optional[str] = Field(None, description="API Key para Groq") 
    
class AgentState(TypedDict):
    user_input: str
    is_valid_math: bool
    solution_raw: str
    structured_solution: str
    final_json: dict
    req:dict
    explain:bool
    api_keys: api_keys