
export const scan_problems=async({file=null})=>{

    const key=verifyGeminiKey()
    if (!key)return

  try {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await axios.post(
          "http://localhost:8000/api/v1/scan_problems",
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