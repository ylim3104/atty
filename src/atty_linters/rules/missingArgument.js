"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingArgument = void 0;
const baseRule_1 = require("./baseRule");
const vscode = __importStar(require("vscode"));
class MissingArgument extends baseRule_1.BaseRule {
    messages;
    constructor(language) {
        super(language);
        try {
            this.messages = require(`../lint_dicts/${language}.json`);
        }
        catch (e) {
            console.error('Failed to load lint dictionary:', e);
        }
    }
    collectFunctionDefinitions(node, defs) {
        if (node.type === 'function_definition') {
            let name = '';
            let requiredArgs = 0;
            for (const child of node.children) {
                if (child.type === 'identifier') {
                    name = child.text;
                }
                if (child.type === 'parameters') {
                    for (const param of child.namedChildren) {
                        if (param.type === 'identifier' ||
                            param.type === 'typed_parameter') {
                            requiredArgs++;
                        }
                    }
                }
            }
            if (name)
                defs.set(name, requiredArgs);
        }
        for (const child of node.children) {
            this.collectFunctionDefinitions(child, defs);
        }
    }
    walk(diagnostics, node) {
        if (!this.messages)
            return;
        const defs = new Map();
        this.collectFunctionDefinitions(node, defs);
        this.checkCalls(diagnostics, node, defs);
    }
    checkCalls(diagnostics, node, defs) {
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
                const range = new vscode.Range(node.startPosition.row, node.startPosition.column, node.endPosition.row, node.endPosition.column);
                diagnostics.push(new vscode.Diagnostic(range, this.messages.missingArgument, vscode.DiagnosticSeverity.Error));
            }
        }
        for (const child of node.children) {
            this.checkCalls(diagnostics, child, defs);
        }
    }
}
exports.MissingArgument = MissingArgument;
//# sourceMappingURL=missingArgument.js.map