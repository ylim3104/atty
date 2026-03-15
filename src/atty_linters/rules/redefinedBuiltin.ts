import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class RedefinedBuiltin extends BaseRule {
    private messages: any;
    private dictionary: any;
    private builtins = new Set<string>();

    constructor(language: string) {
        super(language);
        try {
            this.messages = require(`../lint_dicts/${language}.json`);
            this.dictionary = require(`../../../dicts/${language}_en.json`);
        } catch (e) {
            console.error('Failed to load dictionaries:', e);
        }

        const targetBuiltins = [
            'print',
            'list',
            'len',
            'dict',
            'set',
            'int',
            'str',
            'float',
            'bool',
            'sum',
            'max',
            'min',
            'abs',
            'round',
            'open',
            'input'
        ];

        if (this.dictionary) {
            for (const key of Object.keys(this.dictionary)) {
                if (targetBuiltins.includes(this.dictionary[key])) {
                    this.builtins.add(key);
                }
            }
        }
    }

    public walk(diagnostics: vscode.Diagnostic[], node: Parser.SyntaxNode) {
        if (!this.messages) return;

        if (node.type === 'assignment') {
            const left = node.childForFieldName('left');
            if (left && left.type === 'identifier' && this.builtins.has(left.text)) {
                const range = new vscode.Range(
                    left.startPosition.row,
                    left.startPosition.column,
                    left.endPosition.row,
                    left.endPosition.column
                );

                diagnostics.push(
                    new vscode.Diagnostic(
                        range,
                        this.messages.redefinedBuiltin,
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