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
exports.RedefinedBuiltin = void 0;
const baseRule_1 = require("./baseRule");
const vscode = __importStar(require("vscode"));
class RedefinedBuiltin extends baseRule_1.BaseRule {
    messages;
    dictionary;
    builtins = new Set();
    constructor(language) {
        super(language);
        try {
            this.messages = require(`../lint_dicts/${language}.json`);
            this.dictionary = require(`../../../dicts/${language}_en.json`);
        }
        catch (e) {
            console.error('Failed to load dictionaries:', e);
        }
        const targetBuiltins = [
            'print',
            'list',
            'len',
            'dict',
            'set',
            'int',
            'str',
            'float',
            'bool',
            'sum',
            'max',
            'min',
            'abs',
            'round',
            'open',
            'input'
        ];
        if (this.dictionary) {
            for (const key of Object.keys(this.dictionary)) {
                if (targetBuiltins.includes(this.dictionary[key])) {
                    this.builtins.add(key);
                }
            }
        }
    }
    walk(diagnostics, node) {
        if (!this.messages)
            return;
        if (node.type === 'assignment') {
            const left = node.childForFieldName('left');
            if (left && left.type === 'identifier' && this.builtins.has(left.text)) {
                const range = new vscode.Range(left.startPosition.row, left.startPosition.column, left.endPosition.row, left.endPosition.column);
                diagnostics.push(new vscode.Diagnostic(range, this.messages.redefinedBuiltin, vscode.DiagnosticSeverity.Warning));
            }
        }
        for (const child of node.children) {
            this.walk(diagnostics, child);
        }
    }
}
exports.RedefinedBuiltin = RedefinedBuiltin;
//# sourceMappingURL=redefinedBuiltin.js.map