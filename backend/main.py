from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.agents_router import agents_router
from backend.app.api.exercises_router import exercises_router
import uvicorn
from app.database import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creando/Verificando base de datos SQLite...")
    create_db_and_tables()
    yield
    print("Cerrando conexión...")


app = FastAPI(title="AI Math Tutor Backend",version="1.0.0",lifespan=lifespan)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(exercises_router, prefix="/api/v1/exercises")
app.include_router(agents_router, prefix="/api/v1/agents")

if __name__ == "__main__":

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)