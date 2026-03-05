from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form,Header
from app.models.problems_schema import DetectedProblemsResponse, ExplainRequest
from app.models.format_ui_schema import SolucionMath
from app.data.default import default4
from app.utils.sanitazer import sanitize_latex_highlights
from app.utils.JsonParser import parse_text_to_json
from app.services.agents.detect_problems import detect_problems
from app.services.agents import explain_step

agents_router = APIRouter()

@agents_router.post("/scan_problems", response_model=DetectedProblemsResponse)
async def scan_problems_from_file(file: UploadFile = File(...),x_gemini_key:Optional[str]=Header(None,alias="x_gemini_key")):
    """
    Recibe PDF o Imagen y usa IA Vision para detectar ejercicios.
    """
    if not x_gemini_key:
        raise HTTPException(400, "Falta la API Key de Gemini. Configúrala en Ajustes.")
    return await detect_problems(file, api_key=x_gemini_key)


async def default_json_problem():
    json_res=parse_text_to_json(default4)
    return json_res

@agents_router.post("/explain_step")
async def explain_step_deeply(req: ExplainRequest,x_gemini_key:Optional[str]=Header(None,alias="x_gemini_key"),x_groq_key:Optional[str]=Header(None,alias="x_groq_key")):
    explain_step(x_gemini_key,x_groq_key,req)


async def defoult_solve_problem():
    return {"escenas":[sanitize_latex_highlights(default4)]}

@agents_router.post("/solve",response_model=SolucionMath)
async def solve_problem(
    query: str = Form(None), 
    x_gemini_key: Optional[str] = Header(None, alias="x_gemini_key"),
    x_groq_key: Optional[str] = Header(None, alias="x_groq_key")
):
    solve_problem(query, x_gemini_key, x_groq_key)



