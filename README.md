# 📐 MathPlus

**MathPlus** is a desktop application designed to help students solve and understand mathematical problems using Artificial Intelligence (Gemini/Groq) and an interactive whiteboard.
This is a beta version, so it may contain errors and limitations.

---

## 🚀 Features

* **Math Whiteboard:** Write and solve equations in real time.
* **AI Assistant:** Integration with language models for step-by-step explanations.
* **Exercise Management:** Save and load your progress locally.
* **Cross-Platform:** Built on Electron for a native desktop experience.

---

## 🛠️ Technologies

* **Frontend:** React, Vite, Tailwind CSS, KateX, MathLive.
* **Backend:** Python, FastAPI, SQLite, SQLModel.
* **Desktop:** Electron, Electron Builder.

---

## 🛠️ Installation and Development

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher)
* [Python 3.10+](https://www.python.org/)

### Project Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Fabian-Luna-Vicente/MathPlus.git
   cd MathPlus
   ```

2. **Set up the Backend:**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up the Frontend:**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up Electron (Root):**

   ```bash
   cd ..
   npm install
   ```

---

## 🏗️ How to Generate the Executable (.exe)

To generate the final Windows executable, follow these steps in order:

### 1. Compile the Backend (Python)

We need to convert the FastAPI server into a `.exe` file that Electron can run.

```bash
cd backend
# Make sure PyInstaller is installed
pip install pyinstaller
# Generate the executable (adjust according to your .spec if it exists)
pyinstaller --onefile --windowed --name mathplus-backend main.py
```

*Note: The generated file `mathplus-backend.exe` must be located in `backend/dist/`.*

### 2. Compile the Frontend (React)

Generate the optimized static files.

```bash
cd ../frontend
npm run build
```

### 3. Package with Electron

Finally, bundle everything into the Windows installer.

```bash
cd ..
npm run dist
```

The final installer will be located in the `dist/` folder at the root of the project.

---

## 📁 Project Structure

* `/backend`: Python API server and AI logic.
* `/frontend`: React user interface.
* `main.js`: Electron main process logic.
* `package.json`: Packaging configuration and dependencies.

---

## 📄 License

This project is licensed under the ISC License. See the `LICENSE` file for more details.

---

*Developed with 🌜 by Fabian Luna 🌜*
