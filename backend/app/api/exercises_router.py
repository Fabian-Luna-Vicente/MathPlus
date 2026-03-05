from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from backend.app.services.exercises.exercises_services import exercises_services
from app.database import get_session
from app.models.exercises_schema import ExerciseCreate, ExerciseUpdate

exercises_router=APIRouter()
exercises_services = exercises_services()

@exercises_router.get("/exercises")
def read_exercises(session: Session = Depends(get_session)):
    try:
        exercises=exercises_services.get_exercises(session)
        return exercises
    except Exception as e:
        print(f"Error al obtener ejercicios: {e}")
        raise HTTPException(status_code=500, detail="Error interno al obtener ejercicios")
     

@exercises_router.post("/exercises")
def create_exercise(exercise: ExerciseCreate, session: Session = Depends(get_session)):
    try:
        new_exercise = exercises_services.create_exercise(exercise, session)
        return new_exercise
    except Exception as e:
        print(f"Error al crear ejercicio: {e}")
        raise HTTPException(status_code=500, detail="Error interno al crear ejercicio")


@exercises_router.delete("/exercises/{exercise_id}")
def delete_exercise(exercise_id: int, session: Session = Depends(get_session)):
    try:
        result = exercises_services.delete_exercise(exercise_id, session)
        if not result["ok"]:
            raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
        return {"message": "Ejercicio eliminado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al eliminar ejercicio: {e}")
        raise HTTPException(status_code=500, detail="Error interno al eliminar ejercicio")


@exercises_router.put("/exercises/{exercise_id}")
def update_exercise(
    exercise_id: int, 
    exercise_update: ExerciseUpdate, 
    session: Session = Depends(get_session)
):
    try:
        updated_exercise = exercises_services.update_exercise(exercise_id, exercise_update, session)
        return updated_exercise
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al actualizar ejercicio: {e}")
        raise HTTPException(status_code=500, detail="Error interno al actualizar ejercicio")
