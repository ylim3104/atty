"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rules = void 0;
const compareNone_1 = require("./compareNone");
const missingArgument_1 = require("./missingArgument");
const breakOutsideLoop_1 = require("./breakOutsideLoop");
const returnOutsideFunction_1 = require("./returnOutsideFunction");
const unclosedBracketOrString_1 = require("./unclosedBracketOrString");
const importNotFound_1 = require("./importNotFound");
const zeroDivisionError_1 = require("./zeroDivisionError");
const bareExcept_1 = require("./bareExcept");
const unusedImport_1 = require("./unusedImport");
const unreachableCode_1 = require("./unreachableCode");
const redefinedBuiltin_1 = require("./redefinedBuiltin");
const mutableDefaultArg_1 = require("./mutableDefaultArg");
const useEnumerate_1 = require("./useEnumerate");
const fileNotClosed_1 = require("./fileNotClosed");
const unusedVariable_1 = require("./unusedVariable");
const useDictComprehension_1 = require("./useDictComprehension");
class Rules {
    language;
    ruleList;
    constructor(language) {
        this.language = language;
        this.ruleList = [new compareNone_1.CompareNone(language), new missingArgument_1.MissingArgument(language), new breakOutsideLoop_1.BreakOutsideLoop(language), new returnOutsideFunction_1.ReturnOutsideFunction(language), new unclosedBracketOrString_1.UnclosedBracketOrString(language), new importNotFound_1.ImportNotFound(language), new zeroDivisionError_1.ZeroDivisionErrorRule(language), new bareExcept_1.BareExcept(language), new unusedImport_1.UnusedImport(language), new unreachableCode_1.UnreachableCode(language), new redefinedBuiltin_1.RedefinedBuiltin(language), new mutableDefaultArg_1.MutableDefaultArg(language), new useEnumerate_1.UseEnumerate(language), new fileNotClosed_1.FileNotClosed(language), new unusedVariable_1.UnusedVariable(language), new useDictComprehension_1.UseDictComprehension(language)];
    }
    run(diagnostics, node) {
        this.ruleList.forEach((rule) => { rule.walk(diagnostics, node); });
    }
}
exports.Rules = Rules;
//# sourceMappingURL=rules.js.map