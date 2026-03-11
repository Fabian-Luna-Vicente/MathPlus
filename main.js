const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Variable para guardar la referencia al proceso del backend
let backendProcess = null;

// Configuración: Nombre del ejecutable y puerto
const BACKEND_EXECUTABLE = 'mathplus-backend.exe';
const API_PORT = 8000;

function getBackendPath() {
    // Lógica crítica: Determinar dónde está el .exe
    const isDev = !app.isPackaged;

    if (isDev) {
        // Asumiendo que corres esto desde la raíz y el exe está en backend/dist
        return path.join(__dirname, 'backend', 'dist', BACKEND_EXECUTABLE);
    } else {
        // EN PRODUCCIÓN: Cuando la app está instalada.
        // En Windows, con extraResources, el archivo queda en la raíz de 'resources'
        return path.join(process.resourcesPath, BACKEND_EXECUTABLE);
    }
}

function startBackend() {
    const backendPath = getBackendPath();
    console.log('Lanzando backend desde:', backendPath);

    // 'spawn' ejecuta el .exe como un proceso hijo
    // stdio: 'inherit' permite ver los logs del backend en la consola de Electron 
    backendProcess = spawn(backendPath, [], { stdio: 'inherit' });

    backendProcess.on('error', (err) => {
        console.error('Error al iniciar el backend:', err);
    });

    backendProcess.on('close', (code) => {
        console.log(`El backend se cerró con código ${code}`);
    });
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false, // Por seguridad
            contextIsolation: true,
        },
        icon: path.join(__dirname, './assets/logo.ico')
    });

    const isDev = !app.isPackaged;

    if (isDev) {
        win.loadFile(path.join(__dirname, 'frontend/dist/index.html'));
    } else {
        win.loadFile(path.join(__dirname, 'frontend/dist/index.html'));
    }
}

// --- CICLO DE VIDA DE LA APP ---

app.whenReady().then(() => {
    startBackend(); // 1. Arrancar Python

    // Opcional: Pequeño delay para dar tiempo a FastAPI a iniciar antes de cargar la UI
    setTimeout(createWindow, 1000);
});

// Cuando se cierran todas las ventanas, matar el backend y salir
app.on('window-all-closed', () => {
    if (backendProcess) {
        console.log('Matando proceso del backend...');
        backendProcess.kill();
        backendProcess = null;
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});