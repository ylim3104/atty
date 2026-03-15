import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class CompareNone extends BaseRule {
    private messages: any;

    constructor(language: string) {
        super(language);
        try {
            this.messages = require(`../lint_dicts/kr.json`);
        } catch (e) {
            console.error('Failed to load lint dictionary:', e);
        }
    }

    public walk(diagnostics: vscode.Diagnostic[], node: Parser.SyntaxNode, depth: number = 0) {
        if (!this.messages) return;

        const compareNone = this.messages.compareNone;

        if (node.type === 'comparison_operator') {
            let hasDoubleEquals = false;
            let hasNone = false;

            for (const child of node.children) {
                const indent = '  '.repeat(depth);
                console.log(`${indent}   - Child Node: [${child.type}] | Text: ${child.text}`);
                if (child.type === '==') hasDoubleEquals = true;
                if (child.type === 'identifier' && child.text === compareNone.none) hasNone = true;
            }

            if (hasDoubleEquals && hasNone) {
                const range = new vscode.Range(
                    node.startPosition.row, node.startPosition.column,
                    node.endPosition.row, node.endPosition.column
                );

                const diagnostic = new vscode.Diagnostic(
                    range,
                    compareNone.message,
                    vscode.DiagnosticSeverity.Warning
                );

                diagnostics.push(diagnostic);
            }
        }

        for (const child of node.children) {
            this.walk(diagnostics, child, depth + 1);
        }
    }
}