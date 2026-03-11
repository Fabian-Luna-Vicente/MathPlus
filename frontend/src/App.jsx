import { useState, useEffect } from "react";
import HomeView from "./components/HomeView";
import SettingsView from "./components/SettingsView";
import BoardView from "./components/BoardView"; 
import ExercisesView from "./components/ExercisesView";
import {checkForUpdates} from '../utils/updateHandler'

function App() {
  // --- ESTADO DE NAVEGACIÓN ---
  const [currentView, setCurrentView] = useState('home'); // 'home', 'settings', 'board'
  const [exerciseToLoad, setExerciseToLoad] = useState(null);
  const [currentExerciseId, setCurrentExerciseId] = useState(null);
  // --- ESTADO DE CONFIGURACIÓN ---
  const [apiKeys, setApiKeys] = useState({ gemini: '', groq: '' });

        const [updateStatus, setUpdateStatus] = useState('idle'); // idle, checking, available, latest, error
        const [remoteVersion, setRemoteVersion] = useState(null);
        const [downloadUrl, setDownloadUrl] = useState("");

 useEffect(() => {
    const saved = localStorage.getItem('math_app_keys');
    if (saved) setApiKeys(JSON.parse(saved));
  }, []);
  const hasKeys = !!apiKeys.gemini;

  const navigateTo = (view) => {
    if (view === 'board' && !hasKeys && !exerciseToLoad) { // Permitimos entrar si carga ejercicio local
        alert(" Necesitas configurar tu API Key de Gemini para usar la pizarra.");
        setCurrentView('settings');
        return;
    }
    // Si vamos a la pizarra "limpia", borramos el ejercicio cargado
    if (view === 'board' && currentView !== 'exercises') {
        setExerciseToLoad(null);
    }
    setCurrentView(view);
  };

  const handleLoadExercise = (data,id) => {
      setExerciseToLoad(data);
      setCurrentView('board');  
      setCurrentExerciseId(id);
  };

  // --- RENDERIZADO CONDICIONAL ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-[#00ff66] selection:text-black">
      
      <div className="fixed top-0 left-0 w-full p-4 z-50 pointer-events-none flex item-center gap-2">
          {/* Logo pequeño si no estamos en home */}
          {currentView !== 'home' && (
              <button 
                onClick={() => navigateTo('home')}
                className="pointer-events-auto bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition"
              >
                  MathPlus
              </button>


          )}
                          <img src="https://i.postimg.cc/nChkdgXW/MathPlus.png" alt="MathPlus" className="w-10 h-10 object-contain" />
      </div>

      <div className="pt-16 pb-8 px-4">
        {currentView === 'home' && (
            <HomeView onNavigate={navigateTo} hasApiKeys={hasKeys} setUpdateStatus={setUpdateStatus} setRemoteVersion={setRemoteVersion} setDownloadUrl={setDownloadUrl} updateStatus={updateStatus} />
        )}

        {currentView === 'settings' && (
            <SettingsView onBack={() => navigateTo('home')} onSaveKeys={setApiKeys} updateStatus={updateStatus} remoteVersion={remoteVersion} downloadUrl={downloadUrl} onCheckUpdates={() => checkForUpdates(setUpdateStatus, setRemoteVersion, setDownloadUrl)} />
        )}

        {currentView === 'exercises' && (
            <ExercisesView 
                onBack={() => navigateTo('home')} 
                onLoadExercise={handleLoadExercise} 
            />
        )}

        {currentView === 'board' && (
            <BoardView 
                onBack={() => navigateTo('home')} 
                apiKeys={apiKeys} 
                initialData={exerciseToLoad}
                currentExerciseId={currentExerciseId}
            />
        )}
      </div>
    </div>
  );
}

export default App;