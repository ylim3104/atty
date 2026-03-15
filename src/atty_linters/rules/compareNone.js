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
exports.CompareNone = void 0;
const baseRule_1 = require("./baseRule");
const vscode = __importStar(require("vscode"));
class CompareNone extends baseRule_1.BaseRule {
    messages;
    constructor(language) {
        super(language);
        try {
            this.messages = require(`../lint_dicts/kr.json`);
        }
        catch (e) {
            console.error('Failed to load lint dictionary:', e);
        }
    }
    walk(diagnostics, node, depth = 0) {
        if (!this.messages)
            return;
        const compareNone = this.messages.compareNone;
        if (node.type === 'comparison_operator') {
            let hasDoubleEquals = false;
            let hasNone = false;
            for (const child of node.children) {
                if (child.type === compareNone.equal)
                    hasDoubleEquals = true;
                if (child.type === compareNone.none)
                    hasNone = true;
            }
            if (hasDoubleEquals && hasNone) {
                const range = new vscode.Range(node.startPosition.row, node.startPosition.column, node.endPosition.row, node.endPosition.column);
                const diagnostic = new vscode.Diagnostic(range, compareNone.message, vscode.DiagnosticSeverity.Warning);
                diagnostics.push(diagnostic);
            }
        }
        for (const child of node.children) {
            this.walk(diagnostics, child, depth + 1);
        }
    }
}
exports.CompareNone = CompareNone;
//# sourceMappingURL=compareNone.js.map