import os
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List

from app.models.schemas import ProblemList

def split_problems_with_ai(file_content: bytes, mime_type: str,api_key:str) -> List[str]:
 
    if not api_key:
        print("Error: GEMINI_API_KEY no encontrada.")
        return []

    client = genai.Client(api_key=api_key)

    prompt_text = """
    Analiza esta imagen de una tarea de matemáticas.
    Tu objetivo es EXTRAER cada ejercicio individual para que pueda ser resuelto por separado.

    REGLAS ESTRICTAS DE SEGMENTACIÓN:
    1. Si ves una lista de ejercicios con letras (a), b), c)...) o números romanos (i, ii...), TRÁTALOS COMO PROBLEMAS INDEPENDIENTES. Sepáralos.
    2. NO incluyas el enunciado general (ej: "Simplifica estas expresiones") en cada problema. Solo dame la ecuación o expresión matemática.
    3. Si un ejercicio depende de un contexto (ej: un problema de texto), incluye el contexto necesario.
    4. Devuelve el texto limpio. Usa LaTeX para las fórmulas.
    
    EJEMPLO DE SALIDA ESPERADA:
    [
      "\\log_3 7 + \\log_3 2 =",
      "\\log 15 - \\log 5 =",
      ...
    ]
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Content(
                    parts=[
                        types.Part.from_text(text=prompt_text),
                        types.Part.from_bytes(data=file_content, mime_type=mime_type)
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=ProblemList, # Pasamos la clase Pydantic directo
                temperature=0.1
            )
        )
        if response.parsed:
            return response.parsed.problems
        
        return []

    except Exception as e:
        print(f"Error en AI Splitter (google-genai): {e}")
        return []