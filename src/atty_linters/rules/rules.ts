import { BaseRule } from "./baseRule"
import * as vscode from 'vscode';
import Parser = require('tree-sitter');
import { CompareNone } from './compareNone';

export class Rules {
    language: string;
    ruleList: BaseRule [];
    
    constructor(language: string) {
        this.language = language;
        this.ruleList = [new CompareNone(language)];
    }

    public run(diagnostics: vscode.Diagnostic[], node: Parser.SyntaxNode) {
        this.ruleList.forEach((rule) => { rule.walk(diagnostics, node)})
    }
}