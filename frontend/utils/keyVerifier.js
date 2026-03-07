
export const verifyGeminiKey = () => {
  const keys = JSON.parse(localStorage.getItem("math_app_keys"));
  if (!keys || !keys.gemini) {
    alert("⚠️ Necesitas configurar tu API Key de Gemini primero.");
    return false;
  }
  return keys.gemini;
}

export const verifyGroqKey = () => {
  const keys = JSON.parse(localStorage.getItem("math_app_keys"));
  if (!keys || !keys.groq) {
    alert("⚠️ Necesitas configurar tu API Key de Groq primero.");
    return false;
  }
  return keys.groq;
}
export const verifyGeminiAndGroqKey = () => {
  const keys = JSON.parse(localStorage.getItem("math_app_keys"));
  if (!keys || !keys.gemini || !keys.groq) {
    alert("⚠️ Necesitas configurar tu API Key de Gemini y Groq primero.");
    return false;
  }
  return { gemini: keys.gemini, groq: keys.groq };
}