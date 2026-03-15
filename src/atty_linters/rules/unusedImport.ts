import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class UnusedImport extends BaseRule {
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

        const imports = new Map<string, Parser.SyntaxNode>();
        const used = new Set<string>();

        this.collectImports(node, imports);
        this.collectIdentifiers(node, used);

        for (const [name, importNode] of imports.entries()) {
            if (!used.has(name)) {
                const range = new vscode.Range(
                    importNode.startPosition.row,
                    importNode.startPosition.column,
                    importNode.endPosition.row,
                    importNode.endPosition.column
                );

                diagnostics.push(
                    new vscode.Diagnostic(
                        range,
                        this.messages.unusedImport,
                        vscode.DiagnosticSeverity.Warning
                    )
                );
            }
        }
    }

    private collectImports(node: Parser.SyntaxNode, imports: Map<string, Parser.SyntaxNode>) {
        if (node.type === 'import_statement' || node.type === 'import_from_statement') {
            for (const child of node.namedChildren) {
                if (child.type === 'identifier') {
                    imports.set(child.text, node);
                }
            }
        }

        for (const child of node.children) {
            this.collectImports(child, imports);
        }
    }

    private collectIdentifiers(node: Parser.SyntaxNode, used: Set<string>) {
        if (node.type === 'identifier') {
            used.add(node.text);
        }

        for (const child of node.children) {
            this.collectIdentifiers(child, used);
        }
    }
}