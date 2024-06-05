"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var typescript_json_schema_1 = require("../typescript-json-schema");
var basicFilePath = "./file.ts";
var paths = [
    basicFilePath,
    ".",
    "@some-module",
    "@some-module/my_123",
    "/some/absolute/path-to-file",
    "../relative-path",
    "../../../relative-path/to-file.ts",
    "./relative-path/myFile123.js",
];
var objName = "objectName";
var extendedObjName = "$object12_Name";
var getValues = function (singleQuotation) {
    var quot = singleQuotation ? "'" : '"';
    return {
        path: "".concat(quot).concat(basicFilePath).concat(quot),
        quot: quot,
        quotName: singleQuotation ? "single" : "double",
    };
};
var matchSimple = function (match, singleQuotation, filePath, propertyName) {
    chai_1.assert.isArray(match);
    var quotation = singleQuotation ? "'" : '"';
    var expectedFileName = "".concat(quotation).concat(filePath).concat(quotation);
    (0, chai_1.assert)(match[2] === expectedFileName, "File doesn't match, got: ".concat(match[2], ", expected: ").concat(expectedFileName));
    (0, chai_1.assert)(match[4] === propertyName, "Poperty has to be ".concat(propertyName === null || propertyName === void 0 ? void 0 : propertyName.toString()));
};
var commonTests = function (singleQuotation) {
    var _a = getValues(singleQuotation), quotName = _a.quotName, path = _a.path;
    it("will not match, (".concat(quotName, " quotation mark)"), function () {
        chai_1.assert.isNull((0, typescript_json_schema_1.regexRequire)("pre require(".concat(path, ")")));
        chai_1.assert.isNull((0, typescript_json_schema_1.regexRequire)("  e require(".concat(path, ")")));
        chai_1.assert.isNull((0, typescript_json_schema_1.regexRequire)("require(".concat(path, ")post")));
        chai_1.assert.isNull((0, typescript_json_schema_1.regexRequire)("requir(".concat(path, ")")));
        chai_1.assert.isNull((0, typescript_json_schema_1.regexRequire)("require(".concat(path, ").e-r")));
        chai_1.assert.isNull((0, typescript_json_schema_1.regexRequire)("require(".concat(path)));
        chai_1.assert.isNull((0, typescript_json_schema_1.regexRequire)("require".concat(path, ")")));
        chai_1.assert.isNull((0, typescript_json_schema_1.regexRequire)("require[".concat(path, "]")));
        chai_1.assert.isNull((0, typescript_json_schema_1.regexRequire)("REQUIRE[".concat(path, "]")));
    });
};
var tests = function (singleQuotation, objectName) {
    var _a = getValues(singleQuotation), quotName = _a.quotName, path = _a.path, quot = _a.quot;
    var objNamePath = objectName ? ".".concat(objectName) : "";
    it("basic path (".concat(quotName, " quotation mark)"), function () {
        matchSimple((0, typescript_json_schema_1.regexRequire)("require(".concat(path, ")").concat(objNamePath)), singleQuotation, basicFilePath, objectName);
    });
    it("white spaces and basic path (".concat(quotName, " quotation mark)"), function () {
        matchSimple((0, typescript_json_schema_1.regexRequire)("   require(".concat(path, ")").concat(objNamePath)), singleQuotation, basicFilePath, objectName);
        matchSimple((0, typescript_json_schema_1.regexRequire)("require(".concat(path, ")").concat(objNamePath, "    ")), singleQuotation, basicFilePath, objectName);
        matchSimple((0, typescript_json_schema_1.regexRequire)("      require(".concat(path, ")").concat(objNamePath, "    ")), singleQuotation, basicFilePath, objectName);
        matchSimple((0, typescript_json_schema_1.regexRequire)("      require(".concat(path, ")").concat(objNamePath, "    comment")), singleQuotation, basicFilePath, objectName);
        matchSimple((0, typescript_json_schema_1.regexRequire)("      require(".concat(path, ")").concat(objNamePath, "    comment   ")), singleQuotation, basicFilePath, objectName);
    });
    it("paths (".concat(quotName, " quotation mark)"), function () {
        paths.forEach(function (pathName) {
            matchSimple((0, typescript_json_schema_1.regexRequire)("require(".concat(quot).concat(pathName).concat(quot, ")").concat(objNamePath)), singleQuotation, pathName, objectName);
        });
    });
};
describe("Require regex pattern", function () {
    tests(false);
    commonTests(false);
    tests(true);
    commonTests(true);
    tests(false, objName);
    tests(true, objName);
    tests(false, extendedObjName);
    tests(true, extendedObjName);
});
//# sourceMappingURL=require.test.js.map