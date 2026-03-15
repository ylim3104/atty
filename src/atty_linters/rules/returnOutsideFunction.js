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
exports.ReturnOutsideFunction = void 0;
const baseRule_1 = require("./baseRule");
const vscode = __importStar(require("vscode"));
class ReturnOutsideFunction extends baseRule_1.BaseRule {
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
    walk(diagnostics, node, insideFunction = false) {
        if (!this.messages)
            return;
        const nowInsideFunction = insideFunction || node.type === 'function_definition';
        if (node.type === 'return_statement' && !insideFunction) {
            const range = new vscode.Range(node.startPosition.row, node.startPosition.column, node.endPosition.row, node.endPosition.column);
            diagnostics.push(new vscode.Diagnostic(range, this.messages.returnOutsideFunction, vscode.DiagnosticSeverity.Error));
        }
        for (const child of node.children) {
            this.walk(diagnostics, child, nowInsideFunction);
        }
    }
}
exports.ReturnOutsideFunction = ReturnOutsideFunction;
//# sourceMappingURL=returnOutsideFunction.js.map