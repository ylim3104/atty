import { BaseRule } from "./baseRule"
import * as vscode from 'vscode';
import Parser = require('tree-sitter');
import { CompareNone } from './compareNone';
import { MissingArgument } from "./missingArgument";
import { BreakOutsideLoop } from "./breakOutsideLoop";
import { ReturnOutsideFunction } from "./returnOutsideFunction";
import { UnclosedBracketOrString } from "./unclosedBracketOrString";
import { ImportNotFound } from "./importNotFound";
import { ZeroDivisionErrorRule } from "./zeroDivisionError";
import { BareExcept } from './bareExcept';
import { UnusedImport } from "./unusedImport";
import { UnreachableCode } from "./unreachableCode";
import { RedefinedBuiltin } from "./redefinedBuiltin";
import { MutableDefaultArg } from "./mutableDefaultArg";
import { UseEnumerate } from "./useEnumerate";
import { FileNotClosed } from "./fileNotClosed";
import { UnusedVariable } from "./unusedVariable";
import { UseDictComprehension } from "./useDictComprehension";

import { SyntaxMissingColon } from './syntaxMissingColon';
import { IndentationError } from './indentationError';

export class Rules {
    language: string;
    ruleList: BaseRule[];

    constructor(language: string) {
        this.language = language;
        this.ruleList = [new CompareNone(language), new SyntaxMissingColon(language), new MissingArgument(language), new BreakOutsideLoop(language), new ReturnOutsideFunction(language), new UnclosedBracketOrString(language), new ImportNotFound(language), new ZeroDivisionErrorRule(language), new BareExcept(language), new UnusedImport(language), new UnreachableCode(language), new RedefinedBuiltin(language), new MutableDefaultArg(language), new UseEnumerate(language), new FileNotClosed(language), new UnusedVariable(language), new UseDictComprehension(language)];
    }

    public run(diagnostics: vscode.Diagnostic[], node: Parser.SyntaxNode) {
        this.ruleList.forEach((rule) => { rule.walk(diagnostics, node) })
    }
}