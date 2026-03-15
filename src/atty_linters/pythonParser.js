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
exports.PythonParser = void 0;
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const Parser = require("tree-sitter");
const Python = require("tree-sitter-python");
const rules_1 = require("./rules/rules");
class PythonParser {
    diagnosticCollection;
    parser;
    language;
    constructor(language) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('python-lint');
        this.parser = new Parser();
        this.parser.setLanguage(Python);
        this.language = language;
    }
    updateDiagnostics(document) {
        if (document.languageId !== 'atty')
            return;
        const tree = this.parser.parse(document.getText());
        const diagnostics = [];
        const ruleList = new rules_1.Rules(this.language);
        ruleList.run(diagnostics, tree.rootNode);
        this.diagnosticCollection.set(document.uri, diagnostics);
    }
}
exports.PythonParser = PythonParser;
function activate(context) {
    const parser = new PythonParser('kr');
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => parser.updateDiagnostics(e.document)), vscode.workspace.onDidOpenTextDocument(document => parser.updateDiagnostics(document)), parser.diagnosticCollection);
    console.log('Korean Python Linter is now active!');
}
//# sourceMappingURL=pythonParser.js.map