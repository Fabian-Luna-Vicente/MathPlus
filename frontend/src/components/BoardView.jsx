import React, { useState, useRef, useEffect } from "react";
import axios from 'axios';
import {
  FileText,
  Edit3,
  ClipboardPaste,
  ScanSearch,
  Upload,
  X,
  MessageSquare ,Save// Nuevo icono para instrucciones
} from "lucide-react";

// --- COMPONENTES ---
import MathInput from "./MathInput";
import MathBrowser from "./MathBrowser";
import SidebarRecursos from "./SidebarComponent";
import SceneVisualEditor from "./SceneVisualEditor";
import ProblemSelectorModal from "./ProblemSelectorModal";

// --- HOOKS Y UTILIDADES ---
import { useMathTutor } from "../hooks/useMathTutor";
import { parseTextToJSON } from "../../utils/textParser";
import { calculateFramePositions } from "../../utils/layoutEngine";
import {
  fixLatexHighlighting,
  preventCollisions,
  calculateArrowPositions,
} from "../../utils/latexFixer";

function BoardView({ onBack ,initialData}) { // Recibimos onBack si quieres botón volver
  // --- ESTADOS PRINCIPALES ---
  const [latexInput, setLatexInput] = useState("");
  const [instructions, setInstructions] = useState(""); 
  const [file, setFile] = useState(null);

  // --- ESTADOS DE SELECCIÓN DE PROBLEMAS (MODAL) ---
  const [detectedProblems, setDetectedProblems] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // --- ESTADOS DE NAVEGACIÓN ---
  const [currentStep, setCurrentStep] = useState(0);
  const [targetStep, setTargetStep] = useState(null);

  // --- ESTADOS DE PANTALLA COMPLETA ---
  const playerContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- REFERENCIA AL INPUT DE ARCHIVO ---
  const fileInputRef = useRef(null); 

  // --- ESTADOS DEL EDITOR VISUAL ---
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editableSolution, setEditableSolution] = useState(null);

  // Hook del backend
  const { solveProblem, loading, solution } = useMathTutor();

  // --- EFECTO: PANTALLA COMPLETA ---
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerContainerRef.current) playerContainerRef.current.requestFullscreen().catch((err) => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };
  // EFECTO PARA CARGAR DATOS INICIALES
  useEffect(() => {
      if (initialData) {
          let p = fixLatexHighlighting(initialData);
          p = preventCollisions(p);
          p = calculateArrowPositions(p);
          p = calculateFramePositions(p);
          setEditableSolution([p]);
      }
  }, [initialData]);

  // --- EFECTO: PROCESAR SOLUCIÓN DEL BACKEND ---
  useEffect(() => {
    if (!solution || solution.length === 0) {
      setEditableSolution(null);
      return;
    }
    const processed = solution.escenas.map((scene) => {
      let p = fixLatexHighlighting(scene);
      p = preventCollisions(p);
      p = calculateArrowPositions(p);
      return calculateFramePositions(p);
    });
    setEditableSolution(processed);
  }, [solution]);


  // --- MANEJADORES DE LÓGICA ---

  const resetNavigation = () => {
    setTargetStep(null);
    setCurrentStep(0);
  };

  // 1. MANEJO EXCLUSIVO DE ARCHIVOS
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setLatexInput(""); // Borramos texto si sube archivo
    }
  };

  const handleClearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 2. MANEJO EXCLUSIVO DE TEXTO
  const handleLatexChange = (val) => {
      setLatexInput(val);
      if (val && file) {
          // Si empieza a escribir, borramos el archivo
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
      }
  };
const handleSaveToLibrary = async () => {
      if (!editableSolution) return;

      const titulo = prompt("Asigna un nombre a este ejercicio:", "Resolución Matemática");
      if (!titulo) return;

      const payload = {
          titulo: titulo,
          contenido_json: JSON.stringify(editableSolution[0]), // Guardamos la primera escena (o todo el array si prefieres)
          tags: "Álgebra", // Podrías pedir esto también
          fecha: new Date().toLocaleDateString()
      };

      try {
          await axios.post("http://localhost:8000/api/v1/exercises", payload);
          alert("✅ ¡Ejercicio guardado en tu biblioteca!");
      } catch (error) {
          console.error(error);
          alert("Error al guardar.");
      }
  };
  const handleScanAndSolve = async () => {
    const keys = JSON.parse(localStorage.getItem("math_app_keys"));

    if (!keys || !keys.gemini) {
      alert("⚠️ Necesitas configurar tu API Key de Gemini primero.");
      return; 
    }

    // A. SOLUCIÓN POR TEXTO
    if (!file && latexInput) {
      // Enviamos input + instrucciones adicionales
      solveProblem(latexInput, instructions);
      resetNavigation();
      return;
    }

    // B. SOLUCIÓN POR ARCHIVO (SCAN)
    if (file) {
      setIsScanning(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        // Nota: Las instrucciones adicionales no se envían al scan, 
        // se enviarán luego cuando elijas el problema.
        
        const response = await axios.post(
          "http://localhost:8000/api/v1/scan_problems",
          formData,
          { headers: { x_gemini_key: keys.gemini } }
        );

        const data = response.data;
        if (data.problems && data.problems.length > 0) {
          if (data.problems.length > 1) {
            setDetectedProblems(data.problems);
            setShowSelector(true);
          } else {
            // Un solo problema -> Lo resolvemos pasando las instrucciones
            solveProblem(data.problems[0], instructions);
            resetNavigation();
          }
        } else {
          alert("No pude leer ejercicios en la imagen.");
        }
      } catch (error) { 
        console.error(error);
        alert("Error al leer el archivo.");
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleSelectProblem = (problemText) => {
    setShowSelector(false);
    // Resolvemos el problema elegido + instrucciones
    solveProblem(problemText, instructions);
    resetNavigation();
  };

  const handleResourceClick = (stepIndex) => setTargetStep(stepIndex);

  const handleSaveEdits = (editedScene) => {
    const newSolution = [...editableSolution];
    newSolution[0] = calculateFramePositions(editedScene);
    setEditableSolution(newSolution);
    setIsEditorOpen(false);
    setCurrentStep(0);
  };

  const handleImportJSON = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const parsedData = JSON.parse(clipboardText);
      let sceneToProcess = parsedData.escenas ? parsedData.escenas[0] : parsedData;
      if (!sceneToProcess.cont) throw new Error("Formato inválido");

      let p = fixLatexHighlighting(sceneToProcess);
      p = preventCollisions(p);
      p = calculateArrowPositions(p);
      p = calculateFramePositions(p);

      setEditableSolution([p]);
      resetNavigation();
    } catch (err) {
      alert("⚠️ Error al importar JSON:\n\n" + err.message);
    }
  };

  // --- RENDERIZADO ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 p-8 font-sans selection:bg-[#00ff66] selection:text-black relative animate-in fade-in duration-500">
      
      {/* Botón Volver (Opcional) */}
      {onBack && (
          <button onClick={onBack} className="absolute top-8 left-8 text-neutral-500 hover:text-white transition">
              &larr; Volver al Inicio
          </button>
      )}

      <header className="max-w-6xl mx-auto mb-8 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          MathPlus <span className="text-[#00ff66]">Board</span>
        </h1>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA: INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111] border border-neutral-800 p-6 rounded-xl shadow-2xl space-y-4">
            
            {/* 1. INPUT MATEMÁTICO (Deshabilitado si hay archivo) */}
            <div className={`transition-opacity ${file ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-[#00ff66] font-bold uppercase">Problema Matemático</label>
                    {latexInput && !file && (
                        <button onClick={() => setLatexInput("")} className="text-xs text-neutral-500 hover:text-red-400">Borrar</button>
                    )}
                </div>
                <MathInput 
                    value={latexInput} 
                    onChange={handleLatexChange} 
                />
            </div>

            {/* Separador "O" */}
            <div className="flex items-center gap-4">
                <div className="h-px bg-neutral-800 flex-1"/>
                <span className="text-xs text-neutral-600 font-bold">O SUBE UNA IMAGEN</span>
                <div className="h-px bg-neutral-800 flex-1"/>
            </div>

            {/* 2. ZONA DE ARCHIVOS (Deshabilitada si hay texto) */}
            <div
              onClick={() => !latexInput && fileInputRef.current.click()}
              className={`
                border-2 border-dashed rounded-lg p-4 transition-all duration-300 flex items-center justify-center gap-3 relative group
                ${latexInput 
                    ? 'opacity-50 cursor-not-allowed border-neutral-800 bg-neutral-900/50' 
                    : 'cursor-pointer border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800'
                }
                ${file ? 'border-[#00ff66] bg-[#00ff66]/5' : ''}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                disabled={!!latexInput}
                onChange={handleFileSelect}
              />

              {file ? (
                <>
                  <FileText className="text-[#00ff66]" size={24} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{file.name}</p>
                    <p className="text-xs text-[#00ff66]">Listo para escanear</p>
                  </div>
                  <button onClick={handleClearFile} className="p-1 rounded-full hover:bg-red-500/20 text-neutral-400 hover:text-red-500 transition">
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="text-neutral-500" size={20} />
                  <span className="text-sm font-medium text-neutral-500">
                    {latexInput ? "Borra el texto para subir archivo" : "Subir PDF o Imagen"}
                  </span>
                </>
              )}
            </div>

            {/* 3. INPUT DE INSTRUCCIONES (Siempre activo) */}
            <div className="pt-2">
                <label className="text-xs text-neutral-400 font-bold uppercase mb-2 flex items-center gap-2">
                    <MessageSquare size={14}/> Instrucciones Adicionales (Opcional)
                </label>
                <textarea 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Ej: Resuelve usando factorización, explica como a un niño de 10 años..."
                    className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-lg p-3 text-sm text-white focus:border-[#00ff66] focus:outline-none min-h-[80px] resize-none"
                />
            </div>

            {/* Botón Principal */}
            <button
              onClick={handleScanAndSolve}
              disabled={loading || isScanning || (!latexInput && !file)}
              className="w-full bg-[#00ff66] text-black font-extrabold py-3 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:bg-neutral-800 disabled:text-neutral-500 hover:bg-[#33ff88] hover:shadow-[0_0_20px_rgba(0,255,102,0.4)] active:scale-95 flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <> <ScanSearch className="animate-pulse" /> Escaneando... </>
              ) : loading ? (
                "Resolviendo..."
              ) : (
                "Comenzar Tutoría"
              )}
            </button>

            <button
              onClick={handleImportJSON}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-transparent border-2 border-dashed border-neutral-700 text-neutral-400 font-bold py-3 rounded-lg transition-all hover:border-[#00ff66] hover:text-[#00ff66] disabled:opacity-30"
            >
              <ClipboardPaste size={18} /> Importar JSON
            </button>
            <button
          onClick={handleSaveToLibrary}
          disabled={!editableSolution} // Solo activo si hay solución
          className="flex items-center justify-center gap-2 bg-neutral-800 text-white font-bold py-3 rounded-lg transition-all hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
          <Save size={16} /> Guardar
        </button>
          </div>

          {/* Sidebar de Recursos */}
          {editableSolution && editableSolution[0]?.resources && !isFullscreen && (
              <SidebarRecursos
                resources={editableSolution[0].resources}
                currentStepIdx={currentStep}
                onResourceClick={handleResourceClick}
              />
          )}
        </div>

        {/* COLUMNA DERECHA: MATH BROWSER */}
        <div className="lg:col-span-8 h-[650px] flex flex-col relative">
          {editableSolution && !isFullscreen && (
            <div className="absolute -top-12 right-0 z-10">
              <button
                onClick={() => setIsEditorOpen(true)}
                className="flex items-center gap-2 bg-[#111] hover:bg-neutral-800 text-neutral-300 hover:text-[#00ff66] border border-neutral-800 hover:border-[#00ff66]/50 px-4 py-2 rounded-lg text-sm font-bold transition shadow-md"
              >
                <Edit3 size={16} /> Corregir IA
              </button>
            </div>
          )}

          {!editableSolution ? (
            <div className="flex-grow flex items-center justify-center bg-[#111] rounded-xl shadow-2xl border border-neutral-800">
              {loading ? (
                <div className="text-center text-neutral-400">
                  <div className="animate-spin w-12 h-12 border-4 border-[#00ff66] border-t-transparent rounded-full mx-auto mb-4 drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]"></div>
                  <h3 className="text-lg font-bold text-white tracking-wide">Analizando Problema...</h3>
                  <p className="text-sm mt-2 text-neutral-500">Esto puede tardar unos segundos</p>
                </div>
              ) : (
                <div className="text-center text-neutral-600">
                  <FileText size={64} className="mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium text-neutral-400">Pizarra Limpia</h3>
                  <p className="text-sm mt-1">Ingresa un problema a la izquierda para comenzar.</p>
                </div>
              )}
            </div>
          ) : (
            <div
              ref={playerContainerRef}
              className={isFullscreen 
                  ? "fixed inset-0 z-[100] bg-[#0a0a0a] flex w-screen h-screen" 
                  : "h-full w-full relative flex flex-col rounded-xl overflow-hidden border border-neutral-800 shadow-2xl"
              }
            >
              <div className="flex-grow h-full w-full relative">
                <MathBrowser
                  key={editableSolution[0].ig || Date.now()}
                  initialScene={editableSolution[0]}
                  onToggleFullscreen={toggleFullscreen}
                  isFullscreen={isFullscreen}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- MODALES --- */}
      <ProblemSelectorModal
        isOpen={showSelector}
        problems={detectedProblems}
        onSelect={handleSelectProblem}
        onCancel={() => setShowSelector(false)}
      />

      {isEditorOpen && editableSolution && (
        <SceneVisualEditor
          sceneData={editableSolution[0]}
          onSave={handleSaveEdits}
          onCancel={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
}

export default BoardView;