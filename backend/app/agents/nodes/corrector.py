
from app.models.agents_schema import AgentState
from app.agents.prompts import corrector_prompt
from app.utils.ai_models_with_keys import use_llm_versatile
from app.utils.JsonParser import parse_text_to_json
from app.utils.sanitazer import sanitize_latex_highlights

async def corrector_node(state: AgentState):
    """Corrige la solución si es necesario (opcional)."""
    prompt=f"{corrector_prompt}\nSolución Actual:\n{state['structured_solution']}"
    try:
        raw_text= await use_llm_versatile(state,prompt)
        raw_scene_dict=parse_text_to_json(raw_text)
        if raw_scene_dict["escenas"]:
            safe_text=sanitize_latex_highlights(raw_scene_dict["escenas"][0])
            final_json={"escenas":[safe_text]}
        else:
            final_json=raw_scene_dict
        return {"final_json": final_json}
    except Exception as e:
        print(f"❌ Error en el corrector: {e}")
        return {"final_json": {}}