import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class UseEnumerate extends BaseRule {
    private messages: any;
    private dictionary: any;
    private rangeWord: string | undefined;
    private lenWord: string | undefined;

    constructor(language: string) {
        super(language);
        try {
            this.messages = require(`../lint_dicts/${language}.json`);
            this.dictionary = require(`../../../dicts/${language}_en.json`);
        } catch (e) {
            console.error('Failed to load dictionaries:', e);
        }

        if (this.dictionary) {
            this.rangeWord = this.getKeyByValue(this.dictionary, 'range');
            this.lenWord = this.getKeyByValue(this.dictionary, 'len');
        }
    }

    private getKeyByValue(object: any, value: any) {
        return Object.keys(object).find(key => object[key] === value);
    }

    public walk(diagnostics: vscode.Diagnostic[], node: Parser.SyntaxNode) {
        if (!this.messages || !this.rangeWord || !this.lenWord) return;

        if (node.type === 'call') {
            const text = node.text.replace(/\s+/g, '');
            const pattern = `${this.rangeWord}(${this.lenWord}(`;
            if (text.includes(pattern)) {
                const range = new vscode.Range(
                    node.startPosition.row,
                    node.startPosition.column,
                    node.endPosition.row,
                    node.endPosition.column
                );

                diagnostics.push(
                    new vscode.Diagnostic(
                        range,
                        this.messages.useEnumerate,
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