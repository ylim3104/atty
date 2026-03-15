import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class UnclosedBracketOrString extends BaseRule {
    private messages: any;

    constructor(language: string) {
        super(language);
        try {
            this.messages = require(`../lint_dicts/${language}.json`);
        } catch (e) {
            console.error('Failed to load lint dictionary:', e);
        }
    }

    public walk(diagnostics: vscode.Diagnostic[], node: Parser.SyntaxNode) {
        if (!this.messages) return;

        if (node.type === 'ERROR') {
            const text = node.text || '';
            if (
                text.includes('"') ||
                text.includes("'") ||
                text.includes('(') ||
                text.includes('[') ||
                text.includes('{')
            ) {
                const range = new vscode.Range(
                    node.startPosition.row,
                    node.startPosition.column,
                    node.endPosition.row,
                    node.endPosition.column
                );

                diagnostics.push(
                    new vscode.Diagnostic(
                        range,
                        this.messages.unclosedBracketOrString,
                        vscode.DiagnosticSeverity.Error
                    )
                );
            }
        }

        for (const child of node.children) {
            this.walk(diagnostics, child);
        }
    }
}