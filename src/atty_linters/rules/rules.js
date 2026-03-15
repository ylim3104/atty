"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rules = void 0;
const compareNone_1 = require("./compareNone");
class Rules {
    language;
    ruleList;
    constructor(language) {
        this.language = language;
        this.ruleList = [new compareNone_1.CompareNone(language)];
    }
    run(diagnostics, node) {
        this.ruleList.forEach((rule) => { rule.walk(diagnostics, node); });
    }
}
exports.Rules = Rules;
//# sourceMappingURL=rules.js.map