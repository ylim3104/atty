import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class BreakOutsideLoop extends BaseRule {
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
        insideLoop: boolean = false
    ) {
        if (!this.messages) return;

        const nowInsideLoop =
            insideLoop ||
            node.type === 'for_statement' ||
            node.type === 'while_statement';

        if (
            (node.type === 'break_statement' || node.type === 'continue_statement') &&
            !insideLoop
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
                    this.messages.breakOutsideLoop,
                    vscode.DiagnosticSeverity.Error
                )
            );
        }

        for (const child of node.children) {
            this.walk(diagnostics, child, nowInsideLoop);
        }
    }
}