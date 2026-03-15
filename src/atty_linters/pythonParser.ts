import * as vscode from 'vscode';
import  Parser = require('tree-sitter');
import Python = require('tree-sitter-python');
import { Rules } from './rules/rules';

export class PythonParser{
    diagnosticCollection: vscode.DiagnosticCollection;
    parser: Parser;
    language: string;

    constructor(language: string) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('python-lint');
        this.parser = new Parser();
        this.parser.setLanguage(Python as any);
        this.language = language;
    }

    public updateDiagnostics(document: vscode.TextDocument) {
        if (document.languageId !== 'atty') return;
        // if (document.languageId !== 'python') return;

        const tree = this.parser.parse(document.getText());
        const diagnostics: vscode.Diagnostic[] = [];
        const ruleList = new Rules(this.language);
        ruleList.run(diagnostics, tree.rootNode);
        this.diagnosticCollection.set(document.uri, diagnostics);
    }
}

export function activate(context: vscode.ExtensionContext) {
    const parser = new PythonParser('kr');
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => parser.updateDiagnostics(e.document)),
        vscode.workspace.onDidOpenTextDocument(document => parser.updateDiagnostics(document)),
        parser.diagnosticCollection
    );
    
    console.log('Korean Python Linter is now active!');
}


