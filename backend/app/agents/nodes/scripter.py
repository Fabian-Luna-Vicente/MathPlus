from app.models.agents_schema import AgentState
from app.agents.prompts import UX_PROMPT
from app.utils.ai_models_with_keys import use_gemini

async def ux_scripter_node(state: AgentState):
    """Convierte la solución en pasos JSON estructurados usando Gemini."""
    print("🎨 Iniciando UX Scripter (Gemini 2.5 Pro)...")
    
    prompt = f"{UX_PROMPT}\nSolución Base (Básate en esto para crear los pasos) ten en cuenta que tambien se puede tratar de una explicacion de una parte de un problema , si es asi ,no saludes y sigue al pie de la letra los pasos dados: \n{state['solution_raw']}"
    
    return {"structured_solution": await use_gemini(state,prompt)}