```md
# Atty

Atty is a multilingual Python learning tool that lets beginners write Python-style code using their native language and run it directly. It currently supports Korean, Spanish, and Farsi, then translates those keywords into standard Python before execution. [code_file:29][code_file:34][code_file:35][code_file:36]

## Why Atty?

Most beginner programming tools assume the learner already understands English programming keywords. Atty lowers that barrier by allowing learners to write familiar control flow and built-in function names in their own language, while still using Python under the hood. [code_file:34][code_file:35][code_file:36]

For example, instead of writing `print("Hello World")`, a learner can write the equivalent keyword in Korean, Spanish, or Farsi and run it through Atty. [code_file:30][code_file:31][code_file:32]

## Features

- Write Python-like code with translated keywords in Korean, Spanish, or Farsi. [code_file:34][code_file:35][code_file:36]
- Detect the language of a source file automatically by matching dictionary keywords found in the file. [code_file:29]
- Translate the source code into standard Python and execute it immediately. [code_file:23][code_file:29]
- Optionally export the translated English Python file using a command-line flag. [code_file:23][code_file:29][code_file:105]
- Run code from a VS Code extension using a play button / command integration. [code_file:82]
- Optionally send Python errors to a local Ollama model for beginner-friendly explanations in the detected language. [code_file:106]

## Supported languages

- Korean [code_file:36]
- Spanish [code_file:34]
- Farsi [code_file:35]

## How it works

Atty reads your source file, detects which supported language it most closely matches, replaces translated keywords with their standard Python equivalents, and then executes the translated result. [code_file:29][code_file:105]

The keyword dictionaries currently include the full standard Python keyword set plus a broader group of commonly used built-ins and methods such as `print`, `input`, `len`, `list`, `dict`, `range`, and others. Each of the Korean, Spanish, and Farsi dictionary files currently contains 64 mapped items. [code_file:34][code_file:35][code_file:36]

## Project structure

```text
atty/
├── setup.py
├── atty_interpreter.py
├── package.json
├── src/
│   └── extension.ts
├── dicts/
│   ├── kr_en_complete.json
│   ├── es_en_complete.json
│   └── fa_en_complete.json
└── syntaxes/
    └── bcit.tmLanguage.json
```

The interpreter looks for dictionary files relative to its own location so it can work both inside the VS Code extension and as an installed CLI tool. [code_file:60][code_file:105]

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd atty
```


### 2. Install the CLI in editable mode

```bash
pip install -e .
```

Editable mode is useful during development because changes to the interpreter or dictionaries are picked up without reinstalling the package. [code_file:104]

## CLI usage

Run a translated script:

```bash
atty path/to/file.atty
```

Export the translated English Python file:

```bash
atty path/to/file.atty --output-py
```

The CLI entry point is registered through `setup.py`, mapping the `atty` command to the interpreter’s `main()` function. [code_file:104][code_file:105]

## VS Code extension

Atty can also run as a VS Code extension. The extension uses TypeScript for the editor integration and calls the Python interpreter in the background. [code_file:82]

Current extension behavior includes:

- Running the active file from the editor. [code_file:82]
- Showing output in a dedicated VS Code output channel. [code_file:82]
- Forcing UTF-8 output so Korean, Spanish, and Farsi text display correctly on Windows. [code_file:82]
- Supporting syntax highlighting through a TextMate grammar file. [code_file:103]


## Syntax highlighting

Atty includes a `tmLanguage.json` grammar for syntax highlighting. In VS Code, a TextMate grammar provides keyword, string, and comment coloring, but it does **not** perform real syntax validation or semantic analysis. [web:83][web:95]

That means the grammar can make Atty code look like a real programming language in the editor, but proper error squiggles and deeper code validation would require a language server or linter integration. [web:95][web:99]

## AI error explanations with Ollama

Atty can optionally pass Python tracebacks to a locally running Ollama instance and ask a model such as `llama3` to explain the error in the learner’s detected language. [code_file:106]

This keeps execution local while making errors more understandable for beginners. The current interpreter sends requests to `http://localhost:11434/api/generate`. [code_file:106]

To use this feature:

1. Install and run Ollama locally.
2. Pull a model such as `llama3`.
3. Run Atty normally and trigger an error in a script. [code_file:106]

## Example

### Spanish

```python
imprimir("¡Hola Mundo!")

si Verdadero:
    imprimir("Bienvenidos al Hackathon")
```


### Korean

```python
출력("안녕 세상!")

만약 참:
    출력("해커톤에 오신 것을 환영합니다!")
```


### Farsi

```python
چاپ("سلام دنیا!")

اگر درست:
    چاپ("به هکاتون خوش آمدید!")
```

These examples follow the same translation approach used by the interpreter: native-language keywords are mapped directly to standard Python before execution. [code_file:29][code_file:34][code_file:35][code_file:36]

## Limitations

Atty currently focuses on **keyword translation**, not full natural-language programming. Variable names and comments are intended to remain as written by the user, while keywords are transliterated into Python equivalents before execution. [code_file:23][code_file:29]

Automatic language detection is based on keyword matching, so mixed-language files or files with very few translated keywords may be harder to classify perfectly. [code_file:29]

Syntax highlighting alone does not provide full syntax-error detection. For advanced validation, linting, or IntelliSense, the next step would be a custom VS Code language server or translation layer that feeds generated Python into existing Python tooling. [web:95][web:101]

## Roadmap

- Better VS Code integration for export and run commands.
- Language-aware linting and diagnostics.
- More supported natural languages.
- Better beginner-facing error explanations.
- Optional side-by-side translated Python preview.


## Inspiration

Atty is built around the idea that programming education should be more accessible to people who do not speak English as their first language.

## License

Add your preferred license here, for example MIT.

```

## Small edits
A few recommendations before you commit it:

- Rename `bcit.tmLanguage.json` to `atty.tmLanguage.json` so the branding matches the app name everywhere.
- If your final interpreter file is `atty_interpreter.py`, update the README tree and CLI examples to use that exact filename consistently.
- If you want, I can also turn this into a shorter hackathon-style README with a demo section, team credits, and a “How we built it” section.```

