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
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "atty" is now active!');
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
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map