import React, { useState, useEffect } from 'react';
import { Save, ChevronLeft, Globe, Key, RefreshCw, AlertCircle, Download, CheckCircle } from 'lucide-react';
import {checkForUpdates,CURRENT_VERSION} from '../../utils/updateHandler'
 
const SettingsView = ({ onBack, onSaveKeys, updateStatus, remoteVersion, downloadUrl, onCheckUpdates }) => {
    // Estado local para el formulario
    const [keys, setKeys] = useState({ gemini: '', groq: '' });
    const [lang, setLang] = useState('es');

    // Cargar al montar
    useEffect(() => {
        const saved = localStorage.getItem('math_app_keys');
        if (saved) setKeys(JSON.parse(saved));
        
        const savedLang = localStorage.getItem('math_app_lang');
        if (savedLang) setLang(savedLang);
    }, []);


    const handleDownload=()=>{
        if (downloadUrl) {
            window.open(downloadUrl,'_blank')
        }
    }

    const handleSave = () => {
        localStorage.setItem('math_app_keys', JSON.stringify(keys));
        localStorage.setItem('math_app_lang', lang);
        
        // Notificar al padre para actualizar estado global
        onSaveKeys(keys); 
        alert("Configuración guardada correctamente.");
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-neutral-800 rounded-full transition">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-white">Configuración</h2>
            </div>

            <div className="space-y-6">
                
                {/* Sección API Keys */}
                <div className="bg-[#111] border border-neutral-800 p-6 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Key className="text-[#00ff66]" size={20}/> API Keys (Necesario)
                    </h3>
                    <p className="text-sm text-neutral-500">
                        Tus claves se guardan localmente en tu equipo. Nunca las compartimos.
                    </p>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-neutral-400 font-bold uppercase mb-1 block">Gemini API Key</label>
                            <input 
                                type="password" 
                                value={keys.gemini}
                                onChange={e => setKeys({...keys, gemini: e.target.value})}
                                placeholder="AIzaSy..."
                                className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-lg p-3 text-white focus:border-[#00ff66] focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-400 font-bold uppercase mb-1 block">Groq API Key (Opcional)</label>
                            <input 
                                type="password" 
                                value={keys.groq}
                                onChange={e => setKeys({...keys, groq: e.target.value})}
                                placeholder="gsk_..."
                                className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-lg p-3 text-white focus:border-[#00ff66] focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Sección Idioma */}
                <div className="bg-[#111] border border-neutral-800 p-6 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Globe className="text-blue-400" size={20}/> Idioma
                    </h3>
                    <div className="flex gap-4">
                        {['es', 'en'].map((l) => (
                            <button
                                key={l}
                                onClick={() => setLang(l)}
                                className={`px-4 py-2 rounded-lg border text-sm font-bold uppercase transition-all ${
                                    lang === l 
                                    ? 'bg-white text-black border-white' 
                                    : 'bg-transparent text-neutral-500 border-neutral-700 hover:border-neutral-500'
                                }`}
                            >
                                {l === 'es' ? 'Español' : 'English'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sección Actualizaciones */}
                <div className="bg-[#111] border border-neutral-800 p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <RefreshCw className={updateStatus === 'checking' ? "animate-spin text-purple-400" : "text-purple-400"} size={20}/> 
                                Actualizaciones
                            </h3>
                            <p className="text-sm text-neutral-500">Versión actual: v{CURRENT_VERSION}</p>
                        </div>
                        
                        {/* Botón Principal */}
                        {updateStatus === 'available' ? (
                            <button 
                                onClick={handleDownload}
                                className="px-4 py-2 bg-[#00ff66] text-black text-sm font-bold rounded-lg hover:bg-[#33ff88] transition flex items-center gap-2 animate-pulse"
                            >
                                <Download size={16}/> Descargar v{remoteVersion}
                            </button>
                        ) : (
                            <button 
                                onClick={onCheckUpdates}
                                disabled={updateStatus === 'checking'}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-bold rounded-lg transition disabled:opacity-50"
                            >
                                {updateStatus === 'checking' ? 'Buscando...' : 'Buscar Updates'}
                            </button>
                        )}
                    </div>
                    {/* Mensajes de Estado */}
                    {updateStatus === 'latest' && (
                        <div className="bg-green-900/20 border border-green-900/50 p-3 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle size={16} /> ¡Tienes la última versión!
                        </div>
                    )}
                    
                    {updateStatus === 'error' && (
                        <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle size={16} /> Error al conectar con el servidor.
                        </div>
                    )}

                    {updateStatus === 'available' && (
                        <div className="bg-purple-900/20 border border-purple-900/50 p-3 rounded-lg text-purple-300 text-sm">
                            <p className="font-bold mb-1">¡Nueva versión disponible!</p>
                            <p>Se ha detectado la versión {remoteVersion}. Descárgala para obtener las nuevas funciones.</p>
                        </div>
                    )}
                </div>

                {/* Botón Guardar */}
                <div className="pt-4 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className="bg-[#00ff66] text-black px-8 py-3 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(0,255,102,0.4)] transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Save size={20}/> Guardar Cambios
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SettingsView;