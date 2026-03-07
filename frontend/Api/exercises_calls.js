import axios from 'axios'

export const saveExercise = async (exercise,titulo,tagsString) => {
      const contentToSave = { escenas: exercise };

      const payload = {
          titulo: titulo,
          contenido_json: JSON.stringify(contentToSave),
          tags: tagsString,
          fecha: new Date().toLocaleDateString()
      };

      try {
          await axios.post("http://localhost:8000/api/v1/exercises/exercises", payload);
          alert("¡Ejercicio guardado en tu biblioteca!");
      } catch (error) {
          console.error(error);
          alert("Error al guardar.");
      }
}

export const updateExercise=async (id,content)=>{
            try {
            await axios.put(`http://localhost:8000/api/v1/exercises/exercises/${id}`, {
                contenido_json: JSON.stringify({ escenas: content }),
            });
            console.log("DB Actualizada");
        } catch (error) {
            console.error(error);
        }
}

export const getExercises = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/exercises/exercises');
            return res.data
        } catch (error) {
            console.error("Error cargando ejercicios:", error);
            return []; 
        } 
    };

export const deleteExercise = async (id) => {

        if (!window.confirm("¿Estás seguro de que quieres eliminar este ejercicio permanentemente?")) return;
        
        try {
            await axios.delete(`http://localhost:8000/api/v1/exercises/exercises/${id}`);
        } catch (e) {
            alert("Error al intentar borrar el ejercicio.",e);
        }

}