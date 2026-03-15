import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class MutableDefaultArg extends BaseRule {
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

        if (node.type === 'default_parameter') {
            const value = node.childForFieldName('value');
            if (
                value &&
                (value.type === 'list' ||
                    value.type === 'dictionary' ||
                    value.type === 'set')
            ) {
                const range = new vscode.Range(
                    value.startPosition.row,
                    value.startPosition.column,
                    value.endPosition.row,
                    value.endPosition.column
                );

                diagnostics.push(
                    new vscode.Diagnostic(
                        range,
                        this.messages.mutableDefaultArg,
                        vscode.DiagnosticSeverity.Warning
                    )
                );
            }
        }

        for (const child of node.children) {
            this.walk(diagnostics, child);
        }
    }
}