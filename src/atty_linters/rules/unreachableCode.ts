import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class UnreachableCode extends BaseRule {
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

        if (node.type === 'block') {
            let terminated = false;

            for (const child of node.namedChildren) {
                if (terminated) {
                    const range = new vscode.Range(
                        child.startPosition.row,
                        child.startPosition.column,
                        child.endPosition.row,
                        child.endPosition.column
                    );

                    diagnostics.push(
                        new vscode.Diagnostic(
                            range,
                            this.messages.unreachableCode,
                            vscode.DiagnosticSeverity.Warning
                        )
                    );
                    break;
                }

                if (
                    child.type === 'return_statement' ||
                    child.type === 'break_statement' ||
                    child.type === 'continue_statement' ||
                    child.type === 'raise_statement'
                ) {
                    terminated = true;
                }
            }
        }

        for (const child of node.children) {
            this.walk(diagnostics, child);
        }
    }
}