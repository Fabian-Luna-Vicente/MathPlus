from app.agents.graph import app_graph

async def explain_step(x_gemini_key,x_groq_key,req):
    
    api_keys={"gemini":x_gemini_key,"groq":x_groq_key}
    initial_state = {
        "user_input": "", 
        "is_valid_math": False,
        "solution_raw": "", 
        "structured_solution": "",
        "final_json": {},
        "api_keys": api_keys,
        "req": req,
        "explain": True
    }
    result = await app_graph.ainvoke(initial_state)
    return result["final_json"]