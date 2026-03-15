# Atty 🌎🐍

Atty is a multilingual Python learning tool that lets beginners write Python-style code using their native language and run it directly. It currently supports **Korean, Spanish, and Farsi**, translating native keywords into standard Python before execution. 

Built for the BCIT Hackathon!

## Why Atty?

Most beginner programming tools assume the learner already understands English. Atty lowers the barrier to entry by allowing learners to write familiar control flow (`if`, `for`, `while`) and built-in functions (`print`, `input`) in their own language, while still leveraging the full power of Python under the hood.

## ✨ Features

- **Native Language Coding**: Write code using translated keywords in Korean, Spanish, or Farsi.
- **Auto-Language Detection**: Atty automatically detects the language of a source file based on keyword weighting.
- **Seamless Execution**: Translates code into standard Python and executes it instantly in memory.
- **VS Code Extension**: Run code directly from the editor with a custom "Play" button, and enjoy native syntax highlighting via our custom `.tmLanguage.json` TextMate grammar.
- **CLI Tool**: Run `atty file.atty` directly from your terminal.
- **Export to Python**: Optionally export your code to a standard English `.py` file to share with others.
- **AI Error Explanations (Zero-Dependency)**: Automatically catches Python tracebacks and sends them to the Gemini 2.5 Flash API to generate a beginner-friendly explanation in the user's native language.

## 🛠 Project Structure

```text
atty/
├── setup.py
├── atty_interpreter.py
├── package.json
├── .env                  # (You create this for the Gemini API key)
├── src/
│   └── extension.ts      # VS Code extension logic
├── dicts/
│   ├── kr_en_complete.json
│   ├── es_en_complete.json
│   └── fa_en_complete.json
└── syntaxes/
    └── atty.tmLanguage.json
```

## 🚀 Installation & Setup

### 1. VS Code Extension (Easiest Way)
You can install the Atty VS Code extension directly from our GitHub Releases page!

1. Go to the [Releases page](https://github.com/your-username/your-repo-name/releases) on this repository.
2. Download the latest `atty-1.0.0.vsix` file.
3. Open VS Code, go to the **Extensions** tab (`Ctrl+Shift+X`).
4. Click the three dots (`...`) in the top right corner of the Extensions panel.
5. Select **Install from VSIX...** and choose the downloaded file.
6. *Note: You will still need to follow Step 3 below to get AI Error Explanations working!*

### 2. Command Line Tool Installation
Install the interpreter in editable mode so you can run it from anywhere on your machine:
```bash
git clone <your-repo-url>
cd atty
pip install -e .
```

### 3. Set up the AI Error Explanations (Gemini API)
Atty uses Google's Gemini to explain coding errors to beginners. We built this to be **zero-dependency**—it uses Python's built-in `urllib`, so you don't need to install any heavy AI packages!

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Create a file named `.env` in the root folder of the project.
3. Add your key to the file:
```text
GEMINI_API_KEY=your_actual_api_key_here
```

## 💻 Usage

### Command Line Interface
Run a translated script:
```bash
atty path/to/file.atty
```

Export the translated English Python file (doesn't execute, just translates):
```bash
atty path/to/file.atty --output-py
```

### VS Code Extension
1. Open any `.atty` file in VS Code. You will see native syntax highlighting!
2. Click the **Play** button in the top right of the editor to run the code, or the **Save As** button to export it to `.py`. Output prints directly to the VS Code Output panel.

## 🧠 Technical Highlights (Hackathon Details)

- **Weighted Language Detection**: Since a single letter like `y` means "and" in Spanish but could be a variable in Farsi, the language detection algorithm weights matches by character length to guarantee accuracy.
- **RTL Terminal Fixes**: Standard developer terminals print Arabic/Farsi characters backwards and disconnected. Atty intercepts Farsi AI translations and uses character-level reversal to ensure they render perfectly Right-to-Left in standard English consoles.
- **Prompt Engineering**: The Gemini prompt dynamically adjusts based on the language. For Korean, it explicitly instructs the model to use natural, conversational politeness levels (`해요체` or `합쇼체`) rather than robotic technical jargon.

## 📝 Examples

### Spanish (`demo_es.atty`)
```python
imprimir("¡Hola Mundo!")
edad = 20
si edad > 18:
    imprimir("Eres un adulto.")
sino:
    imprimir("Eres menor.")
```

### Korean (`demo_kr.atty`)
```python
출력("안녕 세상!")
반복 i 안에 범위(3):
    출력("카운트다운:", i)
```

### Farsi (`demo_fa.atty`)
```python
چاپ("سلام دنیا!")
اگر درست:
    چاپ("به هکاتون خوش آمدید!")
```
