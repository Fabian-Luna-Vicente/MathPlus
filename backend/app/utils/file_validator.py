
from fastapi import HTTPException


async def file_validator(file):
    try:
        mime_type = file.content_type
        # Validamos formatos soportados por Gemini
        if mime_type not in ["application/pdf", "image/jpeg", "image/png", "image/webp"]:
            raise HTTPException(400, "Formato no soportado. Usa PDF, JPG o PNG.")
        
    except Exception as e:
        print(f"Error procesando archivo: {e}")
        raise HTTPException(500, "Error interno al escanear archivo.")