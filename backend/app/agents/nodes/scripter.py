from app.models.agents_schema import AgentState
from app.agents.prompts import UX_PROMPT
from app.utils.ai_models_with_keys import use_gemini

async def ux_scripter_node(state: AgentState):
    """Convierte la solución en pasos JSON estructurados usando Gemini."""
    print("🎨 Iniciando UX Scripter (Gemini 2.5 Pro)...")
    
    base_prompt = UX_PROMPT
    if state.get("explain", True):
        # Instrucción dependiendo del modo ("isolated" o "transition")
        if state.get("req") and getattr(state["req"], "mode", "transition") == "isolated":
            base_prompt += f"\n\n=== INSTRUCCIÓN CRÍTICA (PASO AISLADO) ===\nESTA ES UNA DUDA SOBRE UNA ECUACIÓN AISLADA. ESTÁ ESTRICTAMENTE PROHIBIDO AVANZAR AL SIGUIENTE PASO O CREAR ANIMACIONES DE TRANSICIÓN. Tu animación debe mostrar EXCLUSIVAMENTE LA ECUACIÓN BASE y un texto respondiendo esto al estudiante: {state['user_input']}"
        else:
            base_prompt += f"\n\n=== INSTRUCCIÓN CRÍTICA DE ÚNICO PASO ===\nESTA ES UNA EXPLICACIÓN DE UN SOLO PASO. ESTÁ ESTRICTAMENTE PROHIBIDO RESOLVER EL RESTO DEL PROBLEMA. Tu animación debe mostrar EXCLUSIVAMENTE las operaciones descritas en la Solución Base y detenerse ahí. {state['user_input']}"

    prompt = f"{base_prompt}\nSolución Base (Básate en esto para crear los pasos) ten en cuenta que tambien se puede tratar de una explicacion de una parte de un problema , si es asi ,no saludes y sigue al pie de la letra los pasos dados: \n{state['solution_raw']}"
    
    return {"structured_solution": await use_gemini(state,prompt)}