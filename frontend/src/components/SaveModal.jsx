import React, { useState } from 'react';
import { Save, X, Tag, Plus } from 'lucide-react';

const SUGGESTED_TAGS = ["Álgebra", "Cálculo", "Geometría", "Física", "Examen", "Difícil"];

const SaveModal = ({ isOpen, onClose, onConfirm }) => {
  const [title, setTitle] = useState("Resolución Matemática");
  const [currentTag, setCurrentTag] = useState("");
  const [tags, setTags] = useState(["General"]); // Tag por defecto

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const toggleSuggested = (tag) => {
    if (tags.includes(tag)) {
      removeTag(tag);
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleConfirm = () => {
    if (!title.trim()) {
        alert("El título es obligatorio");
        return;
    }
    // Enviamos las tags unidas por comas para guardar en SQL
    onConfirm(title, tags.join(', '));
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#111] border border-neutral-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
            <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Save className="text-[#00ff66]" /> Guardar Ejercicio
        </h2>

        {/* INPUT TÍTULO */}
        <div className="mb-6">
            <label className="text-xs font-bold text-neutral-400 uppercase mb-2 block">Título del Ejercicio</label>
            <input 
                autoFocus
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-lg p-3 text-white focus:border-[#00ff66] focus:outline-none"
                placeholder="Ej: Ecuación Cuadrática..."
            />
        </div>

        {/* INPUT TAGS */}
        <div className="mb-6">
            <label className="text-xs font-bold text-neutral-400 uppercase mb-2 block">Etiquetas (Tags)</label>
            
            {/* Área de Chips */}
            <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                    <span key={tag} className="bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                        <Tag size={10} /> {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-white"><X size={12}/></button>
                    </span>
                ))}
            </div>

            {/* Input Creador */}
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-[#0a0a0a] border border-neutral-700 rounded-lg p-2 text-sm text-white focus:border-[#00ff66] focus:outline-none"
                    placeholder="Escribe y presiona Enter..."
                />
                <button 
                    onClick={handleAddTag}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white p-2 rounded-lg"
                >
                    <Plus size={18} />
                </button>
            </div>

            {/* Sugerencias */}
            <div className="mt-3">
                <p className="text-[10px] text-neutral-500 mb-2 uppercase">Sugerencias:</p>
                <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TAGS.map(tag => (
                        <button 
                            key={tag}
                            onClick={() => toggleSuggested(tag)}
                            className={`text-xs px-2 py-1 rounded border transition-all ${
                                tags.includes(tag) 
                                ? 'bg-[#00ff66] text-black border-[#00ff66]' 
                                : 'bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-500'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <button onClick={onClose} className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-bold">Cancelar</button>
            <button onClick={handleConfirm} className="px-6 py-2 bg-[#00ff66] text-black rounded-lg font-bold text-sm hover:bg-[#33ff88] transition shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                Confirmar y Guardar
            </button>
        </div>

      </div>
    </div>
  );
};

export default SaveModal;