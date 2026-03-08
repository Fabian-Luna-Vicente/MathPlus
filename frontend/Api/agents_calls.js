import axios from 'axios'
import { verifyGeminiAndGroqKey, verifyGeminiKey } from "../utils/keyVerifier";

export const scan_problems = async (file) => {

  const key = verifyGeminiKey()
  if (!key) return

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      "http://localhost:8000/api/v1/agents/scan_problems",
      formData,
      { headers: { "x-gemini-key": key } }
    );

    const data = response.data;
    return data.problems

  } catch (error) {
    console.error(error);
    alert("Error al leer el archivo.");
    return [];
  }
}

export const get_explain_step = async (stepIndex, data, userQuery) => {
  try {
    const keys = verifyGeminiAndGroqKey()
    const finalContext = `Solicitud del usuario. DUDA ESPECÍFICA DEL ALUMNO: "${userQuery || 'Explícame este paso en general'}"`;
    data.context = finalContext;

    const response = await fetch('http://localhost:8000/api/v1/agents/explain_step', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-key': keys.gemini,
        'x-groq-key': keys.groq
      },
      body: JSON.stringify(data)
    });
    console.log(response)

    const newSceneData = await response.json();
    console.log(newSceneData)
    const newTabId = `expl-${Date.now()}`;
    const newTab = {
      id: newTabId,
      title: `Explicación Paso ${stepIndex}`,
      data: newSceneData.escenas[0],
      activeStep: 0,
      isExplanation: true
    };
    console.log(newTab)
    return { newTab, newTabId };

  } catch (error) {
    alert("Error generando la explicación. Revisa la consola.");
    console.error(error);
    return null;
  }
}