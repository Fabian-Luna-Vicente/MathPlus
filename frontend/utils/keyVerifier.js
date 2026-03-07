   
 export const verifyGeminiKey = () => {
   const keys = JSON.parse(localStorage.getItem("math_app_keys"));
    if (!keys || !keys.gemini) {
      alert("⚠️ Necesitas configurar tu API Key de Gemini primero.");
      return false; 
    }
    return keys.gemini;
}