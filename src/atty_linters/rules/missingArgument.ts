import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import Parser = require('tree-sitter');

export class MissingArgument extends BaseRule {
    private messages: any;

    constructor(language: string) {
        super(language);
        try {
            this.messages = require(`../lint_dicts/${language}.json`);
        } catch (e) {
            console.error('Failed to load lint dictionary:', e);
        }
    }

    private collectFunctionDefinitions(node: Parser.SyntaxNode, defs: Map<string, number>) {
        if (node.type === 'function_definition') {
            let name = '';
            let requiredArgs = 0;

            for (const child of node.children) {
                if (child.type === 'identifier') {
                    name = child.text;
                }

                if (child.type === 'parameters') {
                    for (const param of child.namedChildren) {
                        if (
                            param.type === 'identifier' ||
                            param.type === 'typed_parameter'
                        ) {
                            requiredArgs++;
                        }
                    }
                }
            }

            if (name) defs.set(name, requiredArgs);
        }

        for (const child of node.children) {
            this.collectFunctionDefinitions(child, defs);
        }
    }

    public walk(diagnostics: vscode.Diagnostic[], node: Parser.SyntaxNode) {
        if (!this.messages) return;

        const defs = new Map<string, number>();
        this.collectFunctionDefinitions(node, defs);
        this.checkCalls(diagnostics, node, defs);
    }

    private checkCalls(
        diagnostics: vscode.Diagnostic[],
        node: Parser.SyntaxNode,
        defs: Map<string, number>
    ) {
        if (node.type === 'call') {
            let funcName = '';
            let argCount = 0;

            for (const child of node.children) {
                if (child.type === 'identifier') {
                    funcName = child.text;
                }

                if (child.type === 'argument_list') {
                    argCount = child.namedChildren.length;
                }
            }

            if (funcName && defs.has(funcName) && argCount < (defs.get(funcName) || 0)) {
                const range = new vscode.Range(
                    node.startPosition.row,
                    node.startPosition.column,
                    node.endPosition.row,
                    node.endPosition.column
                );

                diagnostics.push(
                    new vscode.Diagnostic(
                        range,
                        this.messages.missingArgument,
                        vscode.DiagnosticSeverity.Error
                    )
                );
            }
        }

        for (const child of node.children) {
            this.checkCalls(diagnostics, child, defs);
        }
    }
}