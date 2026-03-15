// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "atty" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

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
		exec(`python "${pythonScript}" "${filePath}"`, options, (error, stdout, stderr) => {
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

	let exportDisposable = vscode.commands.registerCommand('atty.exportPython', (uri: vscode.Uri) => {
        // Handle right-click (uri is passed) OR title bar click (active editor)
        let filePath = "";
        if (uri && uri.fsPath) {
            filePath = uri.fsPath;
        } else if (vscode.window.activeTextEditor) {
            filePath = vscode.window.activeTextEditor.document.uri.fsPath;
        } else {
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
        exec(`python "${pythonScript}" "${filePath}" --output-py`, options, (error, stdout, stderr) => {
            if (stdout) outputChannel.appendLine(stdout);
            if (stderr) outputChannel.appendLine(`ERROR:\n${stderr}`);
            if (error) outputChannel.appendLine(`EXECUTION ERROR:\n${error.message}`);
            
            vscode.window.showInformationMessage("Successfully exported to .py!");
            outputChannel.appendLine("-----------------------------------");
        });
    });

	context.subscriptions.push(runDisposable, exportDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
