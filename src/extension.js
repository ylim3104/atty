"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const pythonParser_1 = require("./atty_linters/pythonParser");
const fs = __importStar(require("fs"));
let currentLanguage = null;
let isApplyingQuizReplacement = false;
let isLearningModeActive = false;
let showInlineHints = false;
let liveQuizEnabled = false;
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "atty" is now active!');
    vscode.window.showInformationMessage('atty activated');
    const learningCommand = vscode.commands.registerCommand('atty.startLearningMode', async () => {
        await startLearningMode(context);
    });
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    try {
        (0, pythonParser_1.activate)(context);
        console.log("Linter activated successfully!");
    }
    catch (error) {
        console.error("Linter failed to start:", error);
    }
    // Create an output channel so we can show the Python results at the bottom of the screen
    const outputChannel = vscode.window.createOutputChannel("Atty Interpreter");
    const runDisposable = vscode.commands.registerCommand('atty.runCode', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Please open a file to run!");
            return;
        }
        // Save the file before running if it's dirty
        if (editor.document.isDirty) {
            editor.document.save();
        }
        const filePath = editor.document.uri.fsPath;
        const extensionPath = context.extensionPath;
        const pythonScript = path.join(extensionPath, 'interpreter.py');
        outputChannel.show(true); // Bring the output panel to the front
        outputChannel.appendLine(`Running ${path.basename(filePath)}...\n`);
        // FIX: Force Python to use UTF-8 when sending output to the extension
        const options = {
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        };
        // Execute the python script
        (0, child_process_1.exec)(`python "${pythonScript}" "${filePath}"`, options, (error, stdout, stderr) => {
            if (stdout) {
                outputChannel.appendLine(stdout);
            }
            if (stderr) {
                outputChannel.appendLine(`ERROR:\n${stderr}`);
            }
            if (error) {
                outputChannel.appendLine(`EXECUTION ERROR:\n${error.message}`);
            }
            outputChannel.appendLine("-----------------------------------");
        });
    });
    let exportDisposable = vscode.commands.registerCommand('atty.exportPython', (uri) => {
        // Handle right-click (uri is passed) OR title bar click (active editor)
        let filePath = "";
        if (uri && uri.fsPath) {
            filePath = uri.fsPath;
        }
        else if (vscode.window.activeTextEditor) {
            filePath = vscode.window.activeTextEditor.document.uri.fsPath;
        }
        else {
            vscode.window.showErrorMessage("No file selected!");
            return;
        }
        const extensionPath = context.extensionPath;
        const pythonScript = path.join(extensionPath, 'interpreter.py');
        outputChannel.show(true);
        outputChannel.appendLine(`Exporting ${path.basename(filePath)} to Python...\n`);
        const options = {
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        };
        // Notice the --output-py flag added here
        (0, child_process_1.exec)(`python "${pythonScript}" "${filePath}" --output-py`, options, (error, stdout, stderr) => {
            if (stdout) {
                outputChannel.appendLine(stdout);
            }
            if (stderr) {
                outputChannel.appendLine(`ERROR:\n${stderr}`);
            }
            if (error) {
                outputChannel.appendLine(`EXECUTION ERROR:\n${error.message}`);
            }
            vscode.window.showInformationMessage("Successfully exported to .py!");
            outputChannel.appendLine("-----------------------------------");
        });
    });
    context.subscriptions.push(runDisposable);
    context.subscriptions.push(exportDisposable);
    console.log('Korean Python Linter is now active!');
    const replaceWordCommand = vscode.commands.registerCommand('atty.replaceWord', async (uri, range, replacement) => {
        const document = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(document);
        await editor.edit(editBuilder => {
            editBuilder.replace(range, replacement);
        });
    });
    const inlayHintProvider = vscode.languages.registerInlayHintsProvider({ language: 'python' }, new TranslationInlayHintProvider(context));
    const typingQuizListener = vscode.workspace.onDidChangeTextDocument(async (event) => {
        await handleTypingQuiz(context, event);
    });
    const selectLanguageCommand = vscode.commands.registerCommand('atty.selectLanguage', async () => {
        const language = await vscode.window.showQuickPick([
            { label: 'Korean', value: 'kr' },
            { label: 'Spanish', value: 'es' },
            { label: 'Persian', value: 'fa' }
        ], { placeHolder: 'Choose the language you want to work with' });
        if (!language) {
            return;
        }
        currentLanguage = language.value;
        showInlineHints = false;
        liveQuizEnabled = true;
        vscode.window.showInformationMessage(`atty language set to ${language.label}. Quiz mode is now active.`);
    });
    context.subscriptions.push(learningCommand, replaceWordCommand, selectLanguageCommand, inlayHintProvider, typingQuizListener);
}
async function startLearningMode(context) {
    showInlineHints = true;
    liveQuizEnabled = false;
    if (!currentLanguage) {
        vscode.window.showWarningMessage('Please select a language first.');
        return;
    }
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found.');
        return;
    }
    isLearningModeActive = true;
    try {
        const language = currentLanguage;
        const document = editor.document;
        const fullText = document.getText();
        const sourceToEnglishDict = loadSourceToEnglishDictionary(context, language);
        if (!sourceToEnglishDict) {
            vscode.window.showErrorMessage(`Could not load dictionary for "${language}".`);
            return;
        }
        const englishToSourceDict = reverseDictionary(sourceToEnglishDict);
        const foundKeywords = findEnglishKeywordsInText(fullText, Object.keys(englishToSourceDict));
        if (foundKeywords.length === 0) {
            vscode.window.showInformationMessage('No supported English Python keywords found in this file.');
            return;
        }
        let updatedText = fullText;
        for (const keyword of foundKeywords) {
            const correctTranslation = englishToSourceDict[keyword];
            if (!correctTranslation) {
                continue;
            }
            const options = generateQuizOptions(correctTranslation, Object.values(englishToSourceDict), 2);
            const selected = await vscode.window.showQuickPick(options, {
                placeHolder: `Choose the correct translation for "${keyword}"`
            });
            if (!selected) {
                vscode.window.showInformationMessage('Learning mode cancelled.');
                return;
            }
            if (selected === correctTranslation) {
                updatedText = replaceWholeWord(updatedText, keyword, correctTranslation);
                vscode.window.showInformationMessage(`Correct! "${keyword}" → "${correctTranslation}"`);
            }
            else {
                vscode.window.showWarningMessage(`Not quite. "${keyword}" means "${correctTranslation}".`);
            }
        }
        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(fullText.length));
        await editor.edit(editBuilder => {
            editBuilder.replace(fullRange, updatedText);
        });
        vscode.window.showInformationMessage('Learning mode complete!');
    }
    finally {
        isLearningModeActive = false;
    }
}
async function handleTypingQuiz(context, event) {
    if (!liveQuizEnabled) {
        return;
    }
    if (!currentLanguage) {
        return;
    }
    if (isLearningModeActive) {
        return;
    }
    if (isApplyingQuizReplacement) {
        return;
    }
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    if (event.document !== editor.document) {
        return;
    }
    if (editor.document.languageId !== 'python') {
        return;
    }
    if (event.contentChanges.length !== 1) {
        return;
    }
    const change = event.contentChanges[0];
    const typedText = change.text;
    // Trigger only when a word is finished
    const triggerCharacters = [' ', '\n', '\t', '(', ')', ':', ',', '.'];
    if (!triggerCharacters.includes(typedText)) {
        return;
    }
    const sourceToEnglishDict = loadSourceToEnglishDictionary(context, currentLanguage);
    if (!sourceToEnglishDict) {
        return;
    }
    const englishToSourceDict = reverseDictionary(sourceToEnglishDict);
    const wordRange = getPreviousWordRange(event.document, change.range.start);
    if (!wordRange) {
        return;
    }
    const typedWord = event.document.getText(wordRange);
    if (!typedWord || !(typedWord in englishToSourceDict)) {
        return;
    }
    const correctTranslation = englishToSourceDict[typedWord];
    if (!correctTranslation) {
        return;
    }
    const options = generateQuizOptions(correctTranslation, Object.values(englishToSourceDict), 2);
    const selected = await vscode.window.showQuickPick(options, {
        placeHolder: `Choose the correct translation for "${typedWord}" (${currentLanguage})`
    });
    if (!selected) {
        return;
    }
    if (selected !== correctTranslation) {
        vscode.window.showWarningMessage(`Not quite. "${typedWord}" means "${correctTranslation}".`);
        return;
    }
    isApplyingQuizReplacement = true;
    try {
        await editor.edit(editBuilder => {
            editBuilder.replace(wordRange, correctTranslation);
        });
    }
    finally {
        isApplyingQuizReplacement = false;
    }
}
function getPreviousWordRange(document, position) {
    const lineText = document.lineAt(position.line).text;
    const cursorIndex = position.character;
    // Look at the text before the trigger character
    const textBeforeCursor = lineText.slice(0, cursorIndex);
    // Find the last word before the trigger
    const match = textBeforeCursor.match(/([A-Za-z_][A-Za-z0-9_]*)$/);
    if (!match) {
        return null;
    }
    const word = match[1];
    const startChar = cursorIndex - word.length;
    const endChar = cursorIndex;
    return new vscode.Range(new vscode.Position(position.line, startChar), new vscode.Position(position.line, endChar));
}
class TranslationInlayHintProvider {
    context;
    constructor(context) {
        this.context = context;
    }
    provideInlayHints(document, range) {
        if (!showInlineHints) {
            return [];
        }
        const hints = [];
        const text = document.getText(range);
        if (!currentLanguage) {
            return hints;
        }
        const sourceToEnglish = loadSourceToEnglishDictionary(this.context, currentLanguage);
        if (!sourceToEnglish) {
            return hints;
        }
        const englishToSourceDict = reverseDictionary(sourceToEnglish);
        for (const [englishWord, translatedWord] of Object.entries(englishToSourceDict)) {
            const regex = new RegExp(`\\b${escapeRegExp(englishWord)}\\b`, 'g');
            let match;
            while ((match = regex.exec(text)) !== null) {
                const startOffset = document.offsetAt(range.start) + match.index;
                const endOffset = startOffset + englishWord.length;
                const endPos = document.positionAt(endOffset);
                const hint = new vscode.InlayHint(endPos, ` ${translatedWord}`, vscode.InlayHintKind.Type);
                hint.tooltip = `Suggested translation: "${translatedWord}"`;
                hint.paddingLeft = true;
                hints.push(hint);
            }
        }
        return hints;
    }
}
function loadSourceToEnglishDictionary(context, language) {
    try {
        const dictPath = path.join(context.extensionPath, 'dicts', `${language}_en.json`);
        const raw = fs.readFileSync(dictPath, 'utf8');
        return JSON.parse(raw);
    }
    catch (error) {
        console.error('Failed to load dictionary:', error);
        return null;
    }
}
function reverseDictionary(sourceToEnglish) {
    const englishToSource = {};
    for (const [sourceWord, englishWord] of Object.entries(sourceToEnglish)) {
        englishToSource[englishWord] = sourceWord;
    }
    return englishToSource;
}
function findEnglishKeywordsInText(text, englishKeywords) {
    const found = new Set();
    for (const keyword of englishKeywords) {
        const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'g');
        if (regex.test(text)) {
            found.add(keyword);
        }
    }
    return Array.from(found);
}
function generateQuizOptions(correct, allTranslatedWords, optionCount = 2) {
    const wrongOptions = allTranslatedWords.filter(word => word !== correct);
    shuffleArray(wrongOptions);
    const options = [correct, ...wrongOptions.slice(0, optionCount - 1)];
    shuffleArray(options);
    return options;
}
function replaceWholeWord(text, englishWord, translatedWord) {
    const regex = new RegExp(`\\b${escapeRegExp(englishWord)}\\b`, 'g');
    return text.replace(regex, translatedWord);
}
function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map