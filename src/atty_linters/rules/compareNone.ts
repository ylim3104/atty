import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class CompareNone extends BaseRule {
    private messages: any;
    private dictionary: any;

    constructor(language: string) {
        super(language);
        try {
            this.messages = require(`../lint_dicts/${language}.json`);
        } catch (e) {
            console.error('Failed to load lint dictionary:', e);
        }

        try {
            this.dictionary = require(`../../../dicts/${language}_en.json`);
        } catch (e) {
            console.error('Failed to load lint dictionary:', e);
        }
    }

    private getKeyByValue(object: any, value: any) {
        return Object.keys(object).find(key => object[key] === value);
    }

    public walk(diagnostics: vscode.Diagnostic[], node: Parser.SyntaxNode, depth: number = 0) {
        if (!this.messages) return;

        const compareNone = this.messages.compareNone;
        const none = this.getKeyByValue(this.dictionary, "None");

        if (node.type === 'comparison_operator') {
            let hasDoubleEquals = false;
            let hasNone = false;

            for (const child of node.children) {
                if (child.type === '==') hasDoubleEquals = true;
                if (child.type === 'identifier' && child.text === none) hasNone = true;
            }

            if (hasDoubleEquals && hasNone) {
                const range = new vscode.Range(
                    node.startPosition.row, node.startPosition.column,
                    node.endPosition.row, node.endPosition.column
                );

                const diagnostic = new vscode.Diagnostic(
                    range,
                    compareNone,
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