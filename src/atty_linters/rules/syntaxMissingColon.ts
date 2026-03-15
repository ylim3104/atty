import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class SyntaxMissingColon extends BaseRule {
    private messages: any;
    private dictionary: any;
    private keywords: Set<string> = new Set();

    constructor(language: string) {
        super(language);
        try {
            this.messages = require(`../lint_dicts/${language}.json`);
        } catch (e) {
            console.error('Failed to                                    load lint dictionary:', e);
        }

        try {
            this.dictionary = require(`../../../dicts/${language}_en.json`);
        } catch (e) {
            console.error('Failed to load lint dictionary:', e);
        }

        this.keywords = new Set();
        this.initializeKeywords();
    }

    private initializeKeywords() {
        const targets = ["if", "elif", "else", "for", "while", "def", "class", "try"];
        targets.forEach(val => {
            const key = Object.keys(this.dictionary).find(k => this.dictionary[k] === val);
            if (key) this.keywords.add(key);
        });
    }

    public walk(diagnostics: vscode.Diagnostic[], node: Parser.SyntaxNode, depth: number = 0) {
        if (!this.messages) return;

        const keywordChild = node.children.find(child => this.keywords.has(child.text));
        const hasColon = node.children.some(child => child.type === ':' || child.text === ':');


        if (keywordChild && !hasColon) {
            const blockTypes = ['if_statement', 'for_statement', 'function_definition', 'class_definition', 'ERROR'];

            if (blockTypes.includes(node.type)) {
                const range = new vscode.Range(
                    node.startPosition.row, node.startPosition.column,
                    node.endPosition.row, node.endPosition.column
                );

                const diagnostic = new vscode.Diagnostic(
                    range,
                    this.messages.syntaxMissingColon,
                    vscode.DiagnosticSeverity.Error
                );

                diagnostics.push(diagnostic);
            }
        }


        for (const child of node.children) {
            this.walk(diagnostics, child);
        }
    }
}