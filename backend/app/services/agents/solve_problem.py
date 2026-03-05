
from fastapi import HTTPException
from app.agents.graph import app_graph

async def solve_problem(query: str, x_gemini_key: str, x_groq_key: str):
    user_input = ""
    
    if query:
        user_input = query
    else:
        raise HTTPException(400, "Debes enviar texto ")

    initial_state = {
        "user_input": user_input, 
        "is_valid_math": False,
        "solution_raw": "", 
        "structured_solution": "",
        "final_json": {},
        "api_keys": {
            "gemini": x_gemini_key,
            "groq": x_groq_key
        },
        "req": None,
        "explain": False
    }
    result = await app_graph.ainvoke(initial_state)

    if not result["is_valid_math"]:
        raise HTTPException(400, "El contenido no parece ser un problema matemático válido.")
    print("Resultado del Grafo:", result["final_json"])
    return result["final_json"]