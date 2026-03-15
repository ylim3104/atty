import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class ReturnOutsideFunction extends BaseRule {
    private messages: any;

    constructor(language: string) {
        super(language);
        try {
            this.messages = require(`../lint_dicts/${language}.json`);
        } catch (e) {
            console.error('Failed to load lint dictionary:', e);
        }
    }

    public walk(
        diagnostics: vscode.Diagnostic[],
        node: Parser.SyntaxNode,
        insideFunction: boolean = false
    ) {
        if (!this.messages) return;

        const nowInsideFunction = insideFunction || node.type === 'function_definition';

        if (node.type === 'return_statement' && !insideFunction) {
            const range = new vscode.Range(
                node.startPosition.row,
                node.startPosition.column,
                node.endPosition.row,
                node.endPosition.column
            );

            diagnostics.push(
                new vscode.Diagnostic(
                    range,
                    this.messages.returnOutsideFunction,
                    vscode.DiagnosticSeverity.Error
                )
            );
        }

        for (const child of node.children) {
            this.walk(diagnostics, child, nowInsideFunction);
        }
    }
}