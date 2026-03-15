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
exports.MutableDefaultArg = void 0;
const baseRule_1 = require("./baseRule");
const vscode = __importStar(require("vscode"));
class MutableDefaultArg extends baseRule_1.BaseRule {
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
    walk(diagnostics, node) {
        if (!this.messages)
            return;
        if (node.type === 'default_parameter') {
            const value = node.childForFieldName('value');
            if (value &&
                (value.type === 'list' ||
                    value.type === 'dictionary' ||
                    value.type === 'set')) {
                const range = new vscode.Range(value.startPosition.row, value.startPosition.column, value.endPosition.row, value.endPosition.column);
                diagnostics.push(new vscode.Diagnostic(range, this.messages.mutableDefaultArg, vscode.DiagnosticSeverity.Warning));
            }
        }
        for (const child of node.children) {
            this.walk(diagnostics, child);
        }
    }
}
exports.MutableDefaultArg = MutableDefaultArg;
//# sourceMappingURL=mutableDefaultArg.js.map