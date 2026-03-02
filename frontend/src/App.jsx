import React, { useState, useEffect } from "react";
// ... imports de componentes (HomeView, SettingsView, etc.)
import HomeView from "./components/HomeView";
import SettingsView from "./components/SettingsView";
import BoardView from "./components/BoardView"; // <--- Tu antigua App.jsx encapsulada

function App() {
  // --- ESTADO DE NAVEGACIÓN ---
  const [currentView, setCurrentView] = useState('home'); // 'home', 'settings', 'board'
  
  // --- ESTADO DE CONFIGURACIÓN ---
  const [apiKeys, setApiKeys] = useState({ gemini: '', groq: '' });

  // Cargar keys al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('math_app_keys');
    if (saved) setApiKeys(JSON.parse(saved));
  }, []);

  const hasKeys = !!apiKeys.gemini;

  // --- NAVEGACIÓN ---
  const navigateTo = (view) => {
    if (view === 'board' && !hasKeys) {
        // Si intenta ir a la pizarra sin keys, lo mandamos a configuración con aviso
        alert("⚠️ Necesitas configurar tu API Key de Gemini para usar la pizarra.");
        setCurrentView('settings');
        return;
    }
    setCurrentView(view);
  };

  // --- RENDERIZADO CONDICIONAL ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-[#00ff66] selection:text-black">
      
      {/* HEADER GLOBAL (Opcional, o puedes dejarlo dentro de cada vista) */}
      <div className="fixed top-0 left-0 w-full p-4 z-50 pointer-events-none">
          {/* Logo pequeño si no estamos en home */}
          {currentView !== 'home' && (
              <button 
                onClick={() => navigateTo('home')}
                className="pointer-events-auto bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition"
              >
                  MathPlus
              </button>
          )}
      </div>

      <div className="pt-16 pb-8 px-4">
        {currentView === 'home' && (
            <HomeView onNavigate={navigateTo} hasApiKeys={hasKeys} />
        )}

        {currentView === 'settings' && (
            <SettingsView onBack={() => navigateTo('home')} onSaveKeys={setApiKeys} />
        )}

        {currentView === 'board' && (
            // Aquí renderizas tu componente de pizarra antiguo
            // Le pasamos las keys para que el hook useMathTutor las tenga frescas si es necesario
            <BoardView 
                onBack={() => navigateTo('home')} 
                apiKeys={apiKeys} 
            />
        )}
      </div>
    </div>
  );
}

export default App;