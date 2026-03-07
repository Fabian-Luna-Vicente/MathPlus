import {useEffect} from 'react';
import { BookOpen, Settings, Play, AlertTriangle } from 'lucide-react';
import {checkForUpdates} from '../../utils/updateHandler.js'


const HomeView = ({ onNavigate, hasApiKeys,setUpdateStatus,setRemoteVersion,setDownloadUrl }) => {

  useEffect(() => {
    checkForUpdates(setUpdateStatus,setRemoteVersion,setDownloadUrl)
  }, [])
  

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">
          MathPlus <span className="text-[#00ff66]">Desktop</span>
        </h1>
        <p className="text-xl text-neutral-400 max-w-lg mx-auto leading-relaxed">
          Tu tutor de matemáticas personal, privado y potenciado por IA.
          Resuelve, aprende y guarda tus ejercicios localmente.
        </p>
      </div>

      {/* Grid de Acciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
        
        {/* Tarjeta: Ir a Pizarra */}
        <button 
            onClick={() => onNavigate('board')}
            className="group relative p-8 bg-[#111] border border-neutral-800 rounded-2xl hover:border-[#00ff66] hover:bg-[#00ff66]/5 transition-all duration-300 flex flex-col items-center gap-4 shadow-xl"
        >
            <div className="p-4 rounded-full bg-neutral-900 group-hover:bg-[#00ff66] group-hover:text-black transition-colors text-[#00ff66]">
                <Play size={32} fill="currentColor" />
            </div>
            <h3 className="text-xl font-bold text-white">Nueva Pizarra</h3>
            <p className="text-sm text-neutral-500">Resolver un problema paso a paso</p>
            
            {/* Alerta si no hay keys */}
            {!hasApiKeys && (
                <div className="absolute top-4 right-4 text-amber-500 animate-pulse" title="Configura tus API Keys primero">
                    <AlertTriangle size={20} />
                </div>
            )}
        </button>

        {/* Tarjeta: Mis Ejercicios (Placeholder para futuro) */}
       <button 
            onClick={() => onNavigate('exercises')} // <--- Navegar a exercises
            className="group p-8 bg-[#111] border border-neutral-800 rounded-2xl hover:border-[#00ff66] hover:bg-[#00ff66]/5 transition-all duration-300 flex flex-col items-center gap-4 cursor-pointer shadow-xl"
        >
            <div className="p-4 rounded-full bg-neutral-900 group-hover:bg-[#00ff66] group-hover:text-black transition-colors text-neutral-400">
                <BookOpen size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">Mis Ejercicios</h3>
            <p className="text-sm text-neutral-500">Tu biblioteca local</p>
        </button>

      </div>

      {/* Botón Configuración */}
      <button 
        onClick={() => onNavigate('settings')}
        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors px-6 py-2 rounded-full hover:bg-white/5"
      >
        <Settings size={18} />
        <span className="font-medium">Configuración y API Keys</span>
        {!hasApiKeys && <span className="w-2 h-2 rounded-full bg-amber-500" />}
      </button>
      
    </div>
  );
};

export default HomeView;