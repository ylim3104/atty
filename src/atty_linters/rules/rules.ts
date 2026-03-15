import { BaseRule } from "./baseRule"
import * as vscode from 'vscode';
import Parser = require('tree-sitter');
import { CompareNone } from './compareNone';
import { SyntaxMissingColon } from './syntaxMissingColon';
import { IndentationError } from './indentationError';

export class Rules {
    language: string;
    ruleList: BaseRule [];
    
    constructor(language: string) {
        this.language = language;
        this.ruleList = [new CompareNone(language), new SyntaxMissingColon(language)];
    }

    public run(diagnostics: vscode.Diagnostic[], node: Parser.SyntaxNode) {
        this.ruleList.forEach((rule) => { rule.walk(diagnostics, node)})
    }
}