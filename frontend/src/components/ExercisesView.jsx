import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
    BookOpen, 
    Calendar, 
    Trash2, 
    ArrowRight, 
    ChevronLeft, 
    Search, 
    Tag,
    Filter, 
    X
} from 'lucide-react';
import {getExercises} from '../../Api/exercises_calls'

const ExercisesView = ({ onBack, onLoadExercise }) => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTag, setSelectedTag] = useState("all");

    useEffect(() => {
        const fetchExercises=async ()=>{setExercises(await getExercises());setLoading(false) }
        fetchExercises();
    }, []);


    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("¿Estás seguro de que quieres eliminar este ejercicio permanentemente?")) return;
        
        try {
            await axios.delete(`http://localhost:8000/api/v1/exercises/${id}`);
            setExercises(prev => prev.filter(ex => ex.id !== id));
        } catch (e) {
            alert("Error al intentar borrar el ejercicio.",e);
        }
    };

    const uniqueTags = useMemo(() => {
        const tagsSet = new Set();
        exercises.forEach(ex => {
            if (ex.tags) {
                ex.tags.split(',').forEach(tag => tagsSet.add(tag.trim()));
            }
        });
        return Array.from(tagsSet).sort();
    }, [exercises]);

    const filtered = exercises.filter(ex => {
        const term = searchTerm.toLowerCase();
        
        // Coincidencia por texto (Título)
        const matchesSearch = ex.titulo.toLowerCase().includes(term);

        // Coincidencia por Tag Seleccionado
        const matchesTag = selectedTag === "all" 
            ? true 
            : ex.tags.split(',').map(t => t.trim()).includes(selectedTag);

        return matchesSearch && matchesTag;
    });

    return (
        <div className="max-w-6xl mx-auto py-4 animate-in fade-in duration-500">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack} 
                        className="p-2 bg-neutral-900 border border-neutral-800 rounded-full hover:bg-neutral-800 hover:border-neutral-600 transition text-neutral-400 hover:text-white"
                        title="Volver al Inicio"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                            <BookOpen className="text-[#00ff66]" size={32} /> Biblioteca Personal
                        </h2>
                        <p className="text-neutral-500 text-sm mt-1">
                            {exercises.length} ejercicios guardados
                        </p>
                    </div>
                </div>
                
                {/* BARRA DE BÚSQUEDA */}
                <div className="relative w-full md:w-auto group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#00ff66] transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por título..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-72 bg-[#111] border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-[#00ff66] focus:outline-none focus:ring-1 focus:ring-[#00ff66]/20 transition-all placeholder:text-neutral-600"
                    />
                </div>
            </div>

            {/* --- 3. BARRA DE FILTROS (TAGS) --- */}
            <div className="mb-8 overflow-x-auto pb-2 custom-scrollbar">
                <div className="flex items-center gap-2 min-w-max">
                    <div className="text-neutral-500 text-xs font-bold uppercase flex items-center gap-1 mr-2">
                        <Filter size={14} /> Filtrar:
                    </div>
                    
                    {/* Botón "Todos" */}
                    <button
                        onClick={() => setSelectedTag("all")}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            selectedTag === "all"
                            ? "bg-[#00ff66] text-black border-[#00ff66]"
                            : "bg-[#111] text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white"
                        }`}
                    >
                        Todos
                    </button>

                    {/* Lista Dinámica de Tags */}
                    {uniqueTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? "all" : tag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap flex items-center gap-1 ${
                                selectedTag === tag
                                ? "bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]"
                                : "bg-[#111] text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white"
                            }`}
                        >
                            <Tag size={12} /> {tag}
                            {selectedTag === tag && <X size={12} className="ml-1 opacity-50 hover:opacity-100" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- CONTENIDO --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="animate-spin w-10 h-10 border-4 border-[#00ff66] border-t-transparent rounded-full"></div>
                    <p className="text-neutral-500 font-medium">Cargando tu conocimiento...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-[#111] rounded-2xl border border-dashed border-neutral-800 animate-in zoom-in-95 duration-300">
                    <div className="bg-neutral-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen size={32} className="text-neutral-600"/>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-300">No se encontraron resultados</h3>
                    <p className="text-neutral-500 mt-2 max-w-sm mx-auto">
                        No hay ejercicios que coincidan con 
                        {selectedTag !== 'all' ? <span className="text-[#00ff66]"> la etiqueta "{selectedTag}"</span> : ""}
                        {searchTerm ? <span> y la búsqueda "{searchTerm}"</span> : ""}.
                    </p>
                    <button 
                        onClick={() => { setSearchTerm(""); setSelectedTag("all"); }}
                        className="mt-6 px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-bold transition"
                    >
                        Limpiar todos los filtros
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((ex) => (
                        <div 
                            key={ex.id}
                            onClick={() => {
                                try {
                                    const parsedData = JSON.parse(ex.contenido_json);
                                    onLoadExercise(parsedData, ex.id);
                                } catch (e) {
                                    alert("Error: El archivo guardado está corrupto.");
                                    console.error(e);
                                }
                            }}
                            className="bg-[#111] border border-neutral-800 rounded-xl p-5 hover:border-[#00ff66] hover:shadow-[0_0_20px_rgba(0,255,102,0.1)] transition-all cursor-pointer group relative flex flex-col justify-between h-[220px]"
                        >
                            {/* Parte Superior */}
                            <div>
                                <h3 className="text-lg font-bold text-white line-clamp-2 mb-3 leading-tight group-hover:text-[#00ff66] transition-colors">
                                    {ex.titulo}
                                </h3>
                                
                                <div className="flex flex-wrap gap-2">
                                    {ex.tags.split(',').map((tag, i) => (
                                        <span 
                                            key={i} 
                                            className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${
                                                selectedTag === tag.trim() 
                                                ? 'bg-[#00ff66] text-black border-[#00ff66]' 
                                                : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                                            }`}
                                        >
                                            <Tag size={10} /> {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Parte Inferior */}
                            <div className="pt-4 border-t border-neutral-900 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                                    <Calendar size={12}/> {ex.fecha}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={(e) => handleDelete(e, ex.id)}
                                        className="p-2 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition z-10"
                                        title="Eliminar permanentemente"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    
                                    <span className="p-2 bg-[#00ff66]/10 text-[#00ff66] rounded-full group-hover:bg-[#00ff66] group-hover:text-black transition transform group-hover:translate-x-1">
                                        <ArrowRight size={16} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExercisesView;