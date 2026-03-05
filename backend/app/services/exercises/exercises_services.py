from sqlmodel import Session

from app.repository.exercises import exercises_repository
from app.models.exercises_schema import ExerciseCreate, ExerciseUpdate

class exercises_services:
    def __init__(self):
        self.__exercises_repo = exercises_repository()
    
    def get_exercises(self,session: Session):
        return self.__exercises_repo.get_all(session)

    def create_exercise(self, exercise: ExerciseCreate, session: Session):
        return self.__exercises_repo.create_exercise(exercise, session)

    def delete_exercise(self, exercise_id: int, session: Session):
        return self.__exercises_repo.delete_exercise(exercise_id, session)

    def update_exercise(self, exercise_id: int, exercise_update: ExerciseUpdate, session: Session):
        return self.__exercises_repo.update_exercise(exercise_id, exercise_update, session)