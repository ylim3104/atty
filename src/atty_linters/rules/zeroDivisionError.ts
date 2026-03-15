import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class ZeroDivisionErrorRule extends BaseRule {
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

        if (node.type === 'binary_operator') {
            const children = node.children;
            for (let i = 0; i < children.length - 1; i++) {
                if (
                    children[i].type === '/' &&
                    children[i + 1] &&
                    children[i + 1].text === '0'
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
                            this.messages.zeroDivisionError,
                            vscode.DiagnosticSeverity.Error
                        )
                    );
                }
            }
        }

        for (const child of node.children) {
            this.walk(diagnostics, child);
        }
    }
}