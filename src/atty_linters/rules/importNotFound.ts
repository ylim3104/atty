import { BaseRule } from './baseRule';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import Parser = require('tree-sitter');

export class ImportNotFound extends BaseRule {
    private messages: any;

    constructor(language: string) {
        super(language);
        try {
            this.messages = require(`../lint_dicts/${language}.json`);
        } catch (e) {
            console.error('Failed to load lint dictionary:', e);
        }
    }

    public walk(
        diagnostics: vscode.Diagnostic[],
        node: Parser.SyntaxNode,
        document?: vscode.TextDocument
    ) {
        if (!this.messages || !document) return;

        if (node.type === 'import_statement' || node.type === 'import_from_statement') {
            const names = node.namedChildren
                .filter(c => c.type === 'dotted_name' || c.type === 'identifier')
                .map(c => c.text);

            const dir = path.dirname(document.uri.fsPath);

            for (const name of names) {
                const pyPath = path.join(dir, `${name}.py`);
                const pkgPath = path.join(dir, name, '__init__.py');

                if (!fs.existsSync(pyPath) && !fs.existsSync(pkgPath)) {
                    const range = new vscode.Range(
                        node.startPosition.row,
                        node.startPosition.column,
                        node.endPosition.row,
                        node.endPosition.column
                    );

                    diagnostics.push(
                        new vscode.Diagnostic(
                            range,
                            this.messages.importNotFound,
                            vscode.DiagnosticSeverity.Error
                        )
                    );
                    break;
                }
            }
        }

        for (const child of node.children) {
            this.walk(diagnostics, child, document);
        }
    }
}