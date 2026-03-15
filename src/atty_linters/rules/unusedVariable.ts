import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class UnusedVariable extends BaseRule {
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

        const assigned = new Map<string, Parser.SyntaxNode>();
        const used = new Set<string>();

        this.collectAssigned(node, assigned);
        this.collectUsed(node, used);

        for (const [name, assignNode] of assigned.entries()) {
            if (!used.has(name)) {
                const range = new vscode.Range(
                    assignNode.startPosition.row,
                    assignNode.startPosition.column,
                    assignNode.endPosition.row,
                    assignNode.endPosition.column
                );

                diagnostics.push(
                    new vscode.Diagnostic(
                        range,
                        this.messages.unusedVariable,
                        vscode.DiagnosticSeverity.Warning
                    )
                );
            }
        }
    }

    private collectAssigned(node: Parser.SyntaxNode, assigned: Map<string, Parser.SyntaxNode>) {
        if (node.type === 'assignment') {
            const left = node.childForFieldName('left');
            if (left && left.type === 'identifier') {
                assigned.set(left.text, left);
            }
        }

        for (const child of node.children) {
            this.collectAssigned(child, assigned);
        }
    }

    private collectUsed(node: Parser.SyntaxNode, used: Set<string>) {
        if (node.type === 'identifier') {
            used.add(node.text);
        }

        for (const child of node.children) {
            this.collectUsed(child, used);
        }
    }
}