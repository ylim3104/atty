import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class UseDictComprehension extends BaseRule {
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

        const emptyDicts = new Set<string>();
        this.collectEmptyDictAssignments(node, emptyDicts);
        this.checkLoopAssignments(diagnostics, node, emptyDicts);

        for (const child of node.children) {
            this.walk(diagnostics, child);
        }
    }

    private collectEmptyDictAssignments(node: Parser.SyntaxNode, emptyDicts: Set<string>) {
        if (node.type === 'assignment') {
            const left = node.childForFieldName('left');
            const right = node.childForFieldName('right');

            if (left && right && left.type === 'identifier' && right.text === '{}') {
                emptyDicts.add(left.text);
            }
        }

        for (const child of node.children) {
            this.collectEmptyDictAssignments(child, emptyDicts);
        }
    }

    private checkLoopAssignments(
        diagnostics: vscode.Diagnostic[],
        node: Parser.SyntaxNode,
        emptyDicts: Set<string>
    ) {
        if (node.type === 'for_statement') {
            const text = node.text;
            for (const name of emptyDicts) {
                if (text.includes(`${name}[`)) {
                    const range = new vscode.Range(
                        node.startPosition.row,
                        node.startPosition.column,
                        node.endPosition.row,
                        node.endPosition.column
                    );

                    diagnostics.push(
                        new vscode.Diagnostic(
                            range,
                            this.messages.useDictComprehension,
                            vscode.DiagnosticSeverity.Warning
                        )
                    );
                    break;
                }
            }
        }

        for (const child of node.children) {
            this.checkLoopAssignments(diagnostics, child, emptyDicts);
        }
    }
}