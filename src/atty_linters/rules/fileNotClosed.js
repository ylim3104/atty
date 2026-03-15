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
exports.FileNotClosed = void 0;
const baseRule_1 = require("./baseRule");
const vscode = __importStar(require("vscode"));
class FileNotClosed extends baseRule_1.BaseRule {
    messages;
    dictionary;
    openWord;
    closeWord;
    constructor(language) {
        super(language);
        try {
            this.messages = require(`../lint_dicts/${language}.json`);
            this.dictionary = require(`../../../dicts/${language}_en.json`);
        }
        catch (e) {
            console.error('Failed to load dictionaries:', e);
        }
        if (this.dictionary) {
            this.openWord = this.getKeyByValue(this.dictionary, 'open');
            this.closeWord = this.getKeyByValue(this.dictionary, 'close');
        }
    }
    getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
    walk(diagnostics, node) {
        if (!this.messages || !this.openWord || !this.closeWord)
            return;
        const opened = new Map();
        const closed = new Set();
        this.collectOpened(node, opened);
        this.collectClosed(node, closed);
        for (const [name, openNode] of opened.entries()) {
            if (!closed.has(name)) {
                const range = new vscode.Range(openNode.startPosition.row, openNode.startPosition.column, openNode.endPosition.row, openNode.endPosition.column);
                diagnostics.push(new vscode.Diagnostic(range, this.messages.fileNotClosed, vscode.DiagnosticSeverity.Warning));
            }
        }
    }
    collectOpened(node, opened) {
        if (node.type === 'assignment') {
            const left = node.childForFieldName('left');
            const right = node.childForFieldName('right');
            if (left && right && right.text.includes(`${this.openWord}(`)) {
                if (left.type === 'identifier') {
                    opened.set(left.text, node);
                }
            }
        }
        for (const child of node.children) {
            this.collectOpened(child, opened);
        }
    }
    collectClosed(node, closed) {
        if (node.type === 'call') {
            const text = node.text.replace(/\s+/g, '');
            const match = text.match(/^(.+)\./);
            if (match && text.includes(`.${this.closeWord}(`)) {
                closed.add(match[1]);
            }
        }
        for (const child of node.children) {
            this.collectClosed(child, closed);
        }
    }
}
exports.FileNotClosed = FileNotClosed;
//# sourceMappingURL=fileNotClosed.js.map