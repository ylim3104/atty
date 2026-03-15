import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class FileNotClosed extends BaseRule {
    private messages: any;
    private dictionary: any;
    private openWord: string | undefined;
    private closeWord: string | undefined;

    constructor(language: string) {
        super(language);
        try {
            this.messages = require(`../lint_dicts/${language}.json`);
            this.dictionary = require(`../../../dicts/${language}_en.json`);
        } catch (e) {
            console.error('Failed to load dictionaries:', e);
        }

        if (this.dictionary) {
            this.openWord = this.getKeyByValue(this.dictionary, 'open');
            this.closeWord = this.getKeyByValue(this.dictionary, 'close');
        }
    }

    private getKeyByValue(object: any, value: any) {
        return Object.keys(object).find(key => object[key] === value);
    }

    public walk(diagnostics: vscode.Diagnostic[], node: Parser.SyntaxNode) {
        if (!this.messages || !this.openWord || !this.closeWord) return;

        const opened = new Map<string, Parser.SyntaxNode>();
        const closed = new Set<string>();

        this.collectOpened(node, opened);
        this.collectClosed(node, closed);

        for (const [name, openNode] of opened.entries()) {
            if (!closed.has(name)) {
                const range = new vscode.Range(
                    openNode.startPosition.row,
                    openNode.startPosition.column,
                    openNode.endPosition.row,
                    openNode.endPosition.column
                );

                diagnostics.push(
                    new vscode.Diagnostic(
                        range,
                        this.messages.fileNotClosed,
                        vscode.DiagnosticSeverity.Warning
                    )
                );
            }
        }
    }

    private collectOpened(node: Parser.SyntaxNode, opened: Map<string, Parser.SyntaxNode>) {
        if (node.type === 'assignment') {
            const left = node.childForFieldName('left');
            const right = node.childForFieldName('right');

            if (left && right && right.text.includes(`${this.openWord}(`)) {
                if (left.type === 'identifier') {
                    opened.set(left.text, node);
                }
            }
        }

        for (const child of node.children) {
            this.collectOpened(child, opened);
        }
    }

    private collectClosed(node: Parser.SyntaxNode, closed: Set<string>) {
        if (node.type === 'call') {
            const text = node.text.replace(/\s+/g, '');
            const match = text.match(/^(.+)\./);
            if (match && text.includes(`.${this.closeWord}(`)) {
                closed.add(match[1]);
            }
        }

        for (const child of node.children) {
            this.collectClosed(child, closed);
        }
    }
}