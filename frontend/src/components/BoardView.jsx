import React, { useState, useRef, useEffect } from "react";
import axios from 'axios';
import {
  FileText,
  Edit3,
  ScanSearch,
  Upload,
  X,
  MessageSquare,
  Save,
  Download,   // Icono Exportar
  FileJson,   // Icono Importar JSON
  Trash2      // Icono Limpiar
} from "lucide-react";

// --- COMPONENTES ---
import MathInput from "./MathInput";
import MathBrowser from "./MathBrowser";
import SidebarRecursos from "./SidebarComponent";
import SceneVisualEditor from "./SceneVisualEditor";
import ProblemSelectorModal from "./ProblemSelectorModal";
import SaveModal from './SaveModal'
// --- HOOKS Y UTILIDADES ---
import { useMathTutor } from "../hooks/useMathTutor";
import { calculateFramePositions } from "../../utils/layoutEngine";
import {
  fixLatexHighlighting,
  preventCollisions,
  calculateArrowPositions,
} from "../../utils/latexFixer";

function BoardView({ onBack, initialData, currentExerciseId }) {
  // --- ESTADOS PRINCIPALES ---
  const [latexInput, setLatexInput] = useState("");
  const [instructions, setInstructions] = useState(""); 
  const [file, setFile] = useState(null);
const [showSaveModal, setShowSaveModal] = useState(false);
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

  // --- REFERENCIAS A INPUTS OCULTOS ---
  const fileInputRef = useRef(null);      // Para subir imágenes/PDF
  const jsonInputRef = useRef(null);      // Para importar JSON

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

  // --- EFECTO: CARGAR DATOS INICIALES (Desde Biblioteca) ---
  useEffect(() => {
      if (initialData) {
          processAndSetSolution(initialData);
      }
  }, [initialData]);

  // --- EFECTO: PROCESAR SOLUCIÓN DEL BACKEND (Desde IA) ---
  useEffect(() => {
    if (initialData) return; 

    if (!solution || solution.length === 0) {
      setEditableSolution(null);
      return;
    }
    // Procesamos la solución que viene del hook
    // Asumimos que viene como { escenas: [...] }
    const scenes = solution.escenas || solution; 
    const processed = scenes.map(processScene);
    setEditableSolution(processed);
  }, [solution, initialData]);


  // --- UTILIDADES DE PROCESAMIENTO ---
  const processScene = (scene) => {
      let p = fixLatexHighlighting(scene);
      p = preventCollisions(p);
      p = calculateArrowPositions(p);
      return calculateFramePositions(p);
  };

  const processAndSetSolution = (data) => {
      // Manejar si viene como array o como objeto con propiedad escenas
      let scenesToProcess = [];
      if (Array.isArray(data)) scenesToProcess = data;
      else if (data.escenas) scenesToProcess = data.escenas;
      else scenesToProcess = [data];

      const processed = scenesToProcess.map(processScene);
      setEditableSolution(processed);
      resetNavigation();
  };

  const resetNavigation = () => {
    setTargetStep(null);
    setCurrentStep(0);
  };

  // --- MANEJADORES DE INPUTS IZQUIERDOS ---
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setLatexInput(""); 
    }
  };

  const handleClearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLatexChange = (val) => {
      setLatexInput(val);
      if (val && file) {
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
      }
  };

  // --- ACCIONES PRINCIPALES (SCAN / SOLVE) ---
  const handleScanAndSolve = async () => {
    const keys = JSON.parse(localStorage.getItem("math_app_keys"));
    if (!keys || !keys.gemini) {
      alert("⚠️ Necesitas configurar tu API Key de Gemini primero.");
      return; 
    }

    if (!file && latexInput) {
      solveProblem(latexInput, instructions);
      resetNavigation();
      return;
    }

    if (file) {
      setIsScanning(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await axios.post(
          "http://localhost:8000/api/v1/scan_problems",
          formData,
          { headers: { "x-gemini-key": keys.gemini } }
        );

        const data = response.data;
        if (data.problems && data.problems.length > 0) {
          if (data.problems.length > 1) {
            setDetectedProblems(data.problems);
            setShowSelector(true);
          } else {
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
    solveProblem(problemText, instructions);
    resetNavigation();
  };

  const handleSaveClick = () => {
      if (!editableSolution) return;
      setShowSaveModal(true); // Abrimos el modal en lugar del prompt
  };

  // 1. GUARDAR EN DB
  const handleSaveToLibrary = async () => {
      if (!editableSolution) return;

      const titulo = prompt("Asigna un nombre a este ejercicio:", "Resolución Matemática");
      if (!titulo) return;

      // Guardamos la estructura completa para mantener compatibilidad
      const contentToSave = { escenas: editableSolution };

      const payload = {
          titulo: titulo,
          contenido_json: JSON.stringify(contentToSave),
          tags: "Álgebra", 
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

  // 2. EXPORTAR JSON (Descargar archivo)
  const handleExportJSON = () => {
      if (!editableSolution) return;
      
      const dataStr = JSON.stringify({ escenas: editableSolution }, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `math_problem_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleConfirmSave = async (titulo, tagsString) => {
      setShowSaveModal(false); // Cerramos modal

      // Preparamos el contenido
      const contentToSave = { escenas: editableSolution };

      const payload = {
          titulo: titulo,
          contenido_json: JSON.stringify(contentToSave),
          tags: tagsString, // Ahora usamos las tags personalizadas
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

  // 3. IMPORTAR JSON (Leer archivo)
  const handleImportJSONClick = () => {
      if (jsonInputRef.current) jsonInputRef.current.click();
  };

  const handleJSONFileChange = (e) => {
      const fileObj = e.target.files[0];
      if (!fileObj) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const parsedData = JSON.parse(event.target.result);
              processAndSetSolution(parsedData);
              // Limpiar input para permitir subir el mismo archivo de nuevo si se desea
              e.target.value = ''; 
          } catch (err) {
              alert("⚠️ El archivo no es un JSON válido o está corrupto.");
              console.error(err);
          }
      };
      reader.readAsText(fileObj);
  };

  // 4. ACTUALIZAR DESDE EDITOR VISUAL
  const handleSaveEdits = async (editedScene) => {
    const newSolution = [...editableSolution];
    newSolution[0] = calculateFramePositions(editedScene);
    setEditableSolution(newSolution);
    setIsEditorOpen(false);
    setCurrentStep(0);

    if (currentExerciseId) {
        try {
            await axios.put(`http://localhost:8000/api/v1/exercises/${currentExerciseId}`, {
                contenido_json: JSON.stringify({ escenas: newSolution }),
            });
            console.log("✅ DB Actualizada");
        } catch (error) {
            console.error(error);
        }
    }
  };

  const handleResourceClick = (stepIndex) => setTargetStep(stepIndex);

  // --- RENDERIZADO ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 p-8 font-sans selection:bg-[#00ff66] selection:text-black relative animate-in fade-in duration-500">
      
      {/* Botón Volver */}
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
        
        {/* === COLUMNA IZQUIERDA: INPUTS === */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111] border border-neutral-800 p-6 rounded-xl shadow-2xl space-y-4">
            
            {/* Input Matemático */}
            <div className={`transition-opacity ${file ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-[#00ff66] font-bold uppercase">Problema Matemático</label>
                    {latexInput && !file && (
                        <button onClick={() => setLatexInput("")} className="text-xs text-neutral-500 hover:text-red-400">Borrar</button>
                    )}
                </div>
                <MathInput value={latexInput} onChange={handleLatexChange} />
            </div>

            {/* Separador */}
            <div className="flex items-center gap-4">
                <div className="h-px bg-neutral-800 flex-1"/>
                <span className="text-xs text-neutral-600 font-bold">O SUBE UNA IMAGEN</span>
                <div className="h-px bg-neutral-800 flex-1"/>
            </div>

            {/* Zona de Archivos (Imágenes/PDF) */}
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
              <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" disabled={!!latexInput} onChange={handleFileSelect}/>

              {file ? (
                <>
                  <FileText className="text-[#00ff66]" size={24} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{file.name}</p>
                    <p className="text-xs text-[#00ff66]">Listo para escanear</p>
                  </div>
                  <button onClick={handleClearFile} className="p-1 rounded-full hover:bg-red-500/20 text-neutral-400 hover:text-red-500 transition"><X size={18} /></button>
                </>
              ) : (
                <>
                  <Upload className="text-neutral-500" size={20} />
                  <span className="text-sm font-medium text-neutral-500">{latexInput ? "Borra el texto para subir archivo" : "Subir PDF o Imagen"}</span>
                </>
              )}
            </div>

            {/* Input Instrucciones */}
            <div className="pt-2">
                <label className="text-xs text-neutral-400 font-bold uppercase mb-2 flex items-center gap-2">
                    <MessageSquare size={14}/> Instrucciones Adicionales
                </label>
                <textarea 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Ej: Explica como a un niño de 10 años..."
                    className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-lg p-3 text-sm text-white focus:border-[#00ff66] focus:outline-none min-h-[80px] resize-none"
                />
            </div>

            {/* Botón Resolver */}
            <button
              onClick={handleScanAndSolve}
              disabled={loading || isScanning || (!latexInput && !file)}
              className="w-full bg-[#00ff66] text-black font-extrabold py-3 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:bg-neutral-800 disabled:text-neutral-500 hover:bg-[#33ff88] hover:shadow-[0_0_20px_rgba(0,255,102,0.4)] active:scale-95 flex items-center justify-center gap-2"
            >
              {isScanning ? (<> <ScanSearch className="animate-pulse" /> Escaneando... </>) : loading ? ("Resolviendo...") : ("Comenzar Tutoría")}
            </button>
          </div>
          
          {/* Sidebar Recursos (Móvil/Desktop) */}
          {editableSolution && editableSolution[0]?.resources && !isFullscreen && (
              <SidebarRecursos resources={editableSolution[0].resources} currentStepIdx={currentStep} onResourceClick={handleResourceClick} />
          )}
        </div>


        {/* === COLUMNA DERECHA: PIZARRA + TOOLBAR === */}
        <div className="lg:col-span-8 flex flex-col relative h-[700px]">
          
          {/* --- BARRA DE HERRAMIENTAS SUPERIOR --- */}
          <div className="flex items-center justify-between mb-3 bg-[#111] p-2 rounded-lg border border-neutral-800">
             
             {/* Input Oculto para JSON */}
             <input ref={jsonInputRef} type="file" accept=".json" className="hidden" onChange={handleJSONFileChange} />

             <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-500 uppercase px-2">Herramientas</span>
             </div>

             <div className="flex gap-2">
                 {/* 1. Importar JSON */}
                 <button 
                    onClick={handleImportJSONClick} 
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs font-bold hover:text-white hover:border-white transition"
                    title="Cargar archivo .json"
                 >
                    <FileJson size={14} /> Importar
                 </button>

                 {/* 2. Exportar JSON */}
                 <button 
                    onClick={handleExportJSON} 
                    disabled={!editableSolution}
                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs font-bold hover:text-[#00ff66] hover:border-[#00ff66] transition disabled:opacity-30"
                    title="Descargar solución actual"
                 >
                    <Download size={14} /> Exportar
                 </button>

                 {/* 3. Guardar en Biblioteca */}
                 <button 
                    onClick={handleSaveClick} 
                    disabled={!editableSolution}
                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-neutral-800 text-white text-xs font-bold hover:bg-neutral-700 transition disabled:opacity-30"
                 >
                    <Save size={14} /> Guardar
                 </button>

                 {/* 4. Corregir IA (Editar) */}
                 <button
                    onClick={() => setIsEditorOpen(true)}
                    disabled={!editableSolution}
                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#00ff66]/10 border border-[#00ff66]/50 text-[#00ff66] text-xs font-bold hover:bg-[#00ff66] hover:text-black transition disabled:opacity-30"
                 >
                    <Edit3 size={14} /> Corregir IA
                 </button>
             </div>
          </div>

          {/* --- AREA DE LA PIZARRA --- */}
          <div className="flex-grow flex flex-col relative rounded-xl overflow-hidden border border-neutral-800 shadow-2xl bg-[#0a0a0a]">
              {!editableSolution ? (
                <div className="flex-grow flex items-center justify-center bg-[#111]">
                  {loading ? (
                    <div className="text-center text-neutral-400">
                      <div className="animate-spin w-12 h-12 border-4 border-[#00ff66] border-t-transparent rounded-full mx-auto mb-4 drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]"></div>
                      <h3 className="text-lg font-bold text-white tracking-wide">Analizando Problema...</h3>
                    </div>
                  ) : (
                    <div className="text-center text-neutral-600">
                      <FileText size={64} className="mx-auto mb-4 opacity-20" />
                      <h3 className="text-lg font-medium text-neutral-400">Pizarra Limpia</h3>
                      <p className="text-sm mt-1">Ingresa un problema a la izquierda.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  ref={playerContainerRef}
                  className={isFullscreen ? "fixed inset-0 z-[100] bg-[#0a0a0a] flex w-screen h-screen" : "w-full h-full relative"}
                >
                    <MathBrowser
                      key={editableSolution[0].ig || Date.now()}
                      initialScene={editableSolution[0]}
                      onToggleFullscreen={toggleFullscreen}
                      isFullscreen={isFullscreen}
                    />
                </div>
              )}
          </div>
        </div>
      </main>

      {/* --- MODALES --- */}
      <ProblemSelectorModal
        isOpen={showSelector}
        problems={detectedProblems}
        onSelect={handleSelectProblem}
        onCancel={() => setShowSelector(false)}
      />

    <SaveModal 
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleConfirmSave}
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