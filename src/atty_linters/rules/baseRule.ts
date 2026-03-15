import * as vscode from 'vscode';
import Parser = require("tree-sitter");

export class BaseRule {
    language: string;
    
    constructor(language: string) {
        this.language = language;
    }
    public walk(diagnostics: vscode.Diagnostic[], node: Parser.SyntaxNode) {
    }
}