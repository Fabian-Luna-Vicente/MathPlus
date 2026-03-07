
from fastapi import HTTPException
from app.utils.file_validator import file_validator
from app.utils.ProblemSplitterAI import split_problems_with_ai


async def detect_problems(file, api_key):    
    try:
        content = await file.read()
        await file_validator(file)     
        detected_problems = split_problems_with_ai(content, file,api_key=api_key)
        
        if not detected_problems:
            return {"problems": ["No pudimos detectar ejercicios claros. Intenta recortar la imagen."]}
        
        print("Ejercicios detectados:", detected_problems)
        return {"problems": detected_problems}

    except Exception as e:
        print(f"Error procesando archivo: {e}")
        raise HTTPException(500, "Error interno al procesar el documento con IA.")