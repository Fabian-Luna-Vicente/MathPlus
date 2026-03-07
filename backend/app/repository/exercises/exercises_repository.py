
from sqlmodel import Session, select
from fastapi import HTTPException
from sqlmodel import Session, select
from app.database import Ejercicio
from app.models.exercises_schema import ExerciseCreate, ExerciseUpdate


class exercises_repository:   
    def __init__(self):
        pass

    def get_all(self,session: Session):
        return session.exec(select(Ejercicio).order_by(Ejercicio.id.desc())).all()

    def create_exercise(self, exercise: ExerciseCreate, session: Session):
        db_exercise = Ejercicio.model_validate(exercise)
        session.add(db_exercise)
        session.commit()
        session.refresh(db_exercise)
        return db_exercise

    def delete_exercise(self, exercise_id: int, session: Session):
        exercise = session.get(Ejercicio, exercise_id)
        if not exercise:
            return {"ok": False} 
        session.delete(exercise)
        session.commit()
        return {"ok": True}

    def update_exercise(self, exercise_id: int, exercise_update: ExerciseUpdate, session: Session):
        
        db_exercise = session.get(Ejercicio, exercise_id)
        if not db_exercise:
            raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
        
        # Actualizar solo los campos enviados (excluyendo nulos)
        exercise_data = exercise_update.dict(exclude_unset=True)
        for key, value in exercise_data.items():
            setattr(db_exercise, key, value)

        session.add(db_exercise)
        session.commit()
        session.refresh(db_exercise)
        return db_exercise