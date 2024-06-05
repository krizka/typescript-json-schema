"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertRejection = exports.assertSchemas = exports.assertSchema = void 0;
var ajv_1 = require("ajv");
var ajv_formats_1 = require("ajv-formats");
var chai_1 = require("chai");
var fs_1 = require("fs");
var path_1 = require("path");
var typescript_1 = require("typescript");
var TJS = require("../typescript-json-schema");
var ajvWarnings = [];
var ajv = new ajv_1.default({
    logger: {
        log: console.log,
        warn: function (message) {
            ajvWarnings.push(message);
        },
        error: function (message) {
            throw new Error("AJV error: " + message);
        },
    },
    strict: false,
});
(0, ajv_formats_1.default)(ajv);
var BASE = "test/programs/";
function assertSchema(group, type, settings, compilerOptions, only, ajvOptions) {
    if (settings === void 0) { settings = {}; }
    if (ajvOptions === void 0) { ajvOptions = {}; }
    var run = only ? it.only : it;
    run(group + " should create correct schema", function () {
        if (!("required" in settings)) {
            settings.required = true;
        }
        if (!("noExtraProps" in settings)) {
            settings.noExtraProps = true;
        }
        var files = [(0, path_1.resolve)(BASE + group + "/main.ts")];
        var actual = TJS.generateSchema(TJS.getProgramFromFiles(files, compilerOptions), type, settings, files);
        var file = (0, fs_1.readFileSync)(BASE + group + "/schema.json", "utf8");
        var expected = JSON.parse(file);
        chai_1.assert.isObject(actual);
        chai_1.assert.deepEqual(actual, expected, "The schema is not as expected");
        if (actual !== null) {
            ajv.validateSchema(actual);
            chai_1.assert.equal(ajv.errors, null, "The schema is not valid");
            if (!ajvOptions.skipCompile) {
                ajvWarnings = [];
                ajv.compile(actual);
                chai_1.assert.deepEqual(ajvWarnings, ajvOptions.expectedWarnings || [], "Got unexpected AJV warnings");
            }
        }
    });
}
exports.assertSchema = assertSchema;
function assertSchemas(group, type, settings, compilerOptions) {
    if (settings === void 0) { settings = {}; }
    it(group + " should create correct schema", function () {
        if (!("required" in settings)) {
            settings.required = true;
        }
        if (!("noExtraProps" in settings)) {
            settings.noExtraProps = true;
        }
        var generator = TJS.buildGenerator(TJS.getProgramFromFiles([(0, path_1.resolve)(BASE + group + "/main.ts")], compilerOptions), settings);
        var symbols = generator.getSymbols(type);
        for (var _i = 0, symbols_1 = symbols; _i < symbols_1.length; _i++) {
            var symbol = symbols_1[_i];
            var actual = generator.getSchemaForSymbol(symbol.name);
            var file = (0, fs_1.readFileSync)(BASE + group + "/schema.".concat(symbol.name, ".json"), "utf8");
            var expected = JSON.parse(file);
            chai_1.assert.isObject(actual);
            chai_1.assert.deepEqual(actual, expected, "The schema is not as expected");
            if (actual !== null) {
                ajv.validateSchema(actual);
                chai_1.assert.equal(ajv.errors, null, "The schema is not valid");
            }
        }
    });
}
exports.assertSchemas = assertSchemas;
function assertRejection(group, type, settings, compilerOptions, errType) {
    if (settings === void 0) { settings = {}; }
    it(group + " should reject input", function () {
        var schema = null;
        chai_1.assert.throws(function () {
            if (!("required" in settings)) {
                settings.required = true;
            }
            if (!("noExtraProps" in settings)) {
                settings.noExtraProps = true;
            }
            var files = [(0, path_1.resolve)(BASE + group + "/main.ts")];
            schema = TJS.generateSchema(TJS.getProgramFromFiles(files, compilerOptions), type, settings, files);
        }, errType || /.*/);
        chai_1.assert.equal(schema, null, "Expected no schema to be generated");
    });
}
exports.assertRejection = assertRejection;
describe("interfaces", function () {
    it("should return an instance of JsonSchemaGenerator", function () {
        var program = TJS.getProgramFromFiles([(0, path_1.resolve)(BASE + "comments/main.ts")]);
        var generator = TJS.buildGenerator(program);
        chai_1.assert.instanceOf(generator, TJS.JsonSchemaGenerator);
        if (generator !== null) {
            chai_1.assert.doesNotThrow(function () { return generator.getSchemaForSymbol("MyObject"); });
            chai_1.assert.doesNotThrow(function () { return generator.getSchemaForSymbol("Vector3D"); });
            var symbols = generator.getUserSymbols();
            (0, chai_1.assert)(symbols.indexOf("MyObject") > -1);
            (0, chai_1.assert)(symbols.indexOf("Vector3D") > -1);
        }
    });
    it("should output the schemas set by setSchemaOverride", function () {
        var program = TJS.getProgramFromFiles([(0, path_1.resolve)(BASE + "interface-multi/main.ts")]);
        var generator = TJS.buildGenerator(program);
        (0, chai_1.assert)(generator !== null);
        if (generator !== null) {
            var schemaOverride = { type: "string" };
            generator.setSchemaOverride("MySubObject", schemaOverride);
            var schema = generator.getSchemaForSymbol("MyObject");
            chai_1.assert.deepEqual(schema.definitions["MySubObject"], schemaOverride);
        }
    });
    it("should output the schemas set by setSchemaOverride with getSchemaForSymbol", function () {
        var program = TJS.getProgramFromFiles([(0, path_1.resolve)(BASE + "interface-multi/main.ts")]);
        var generator = TJS.buildGenerator(program);
        (0, chai_1.assert)(generator !== null);
        var schemaOverride1 = { type: "string" };
        var schemaOverride2 = { type: "integer" };
        generator === null || generator === void 0 ? void 0 : generator.setSchemaOverride("MySubObject", schemaOverride1);
        generator === null || generator === void 0 ? void 0 : generator.setSchemaOverride("MySubObject2", schemaOverride2);
        var schema = generator === null || generator === void 0 ? void 0 : generator.getSchemaForSymbol("MySubObject");
        chai_1.assert.deepEqual(schemaOverride1, { type: "string" });
        chai_1.assert.deepEqual(schemaOverride2, { type: "integer" });
        chai_1.assert.deepEqual(schema, __assign(__assign({}, schemaOverride1), { $schema: "http://json-schema.org/draft-07/schema#" }));
    });
    it("should output the schemas set by setSchemaOverride with getSchemaForSymbol and other overrides", function () {
        var program = TJS.getProgramFromFiles([(0, path_1.resolve)(BASE + "interface-multi/main.ts")]);
        var generator = TJS.buildGenerator(program);
        (0, chai_1.assert)(generator !== null);
        var schemaOverride1 = { type: "string" };
        var schemaOverride2 = { type: "integer" };
        generator === null || generator === void 0 ? void 0 : generator.setSchemaOverride("MySubObject1", schemaOverride1);
        generator === null || generator === void 0 ? void 0 : generator.setSchemaOverride("MySubObject2", schemaOverride2);
        var schema = generator === null || generator === void 0 ? void 0 : generator.getSchemaForSymbol("MySubObject1", true, true);
        chai_1.assert.deepEqual(schemaOverride1, { type: "string" });
        chai_1.assert.deepEqual(schemaOverride2, { type: "integer" });
        chai_1.assert.deepEqual(schema, __assign(__assign({}, schemaOverride1), { $schema: "http://json-schema.org/draft-07/schema#", definitions: {
                MySubObject1: {
                    type: "string"
                },
                MySubObject2: {
                    type: "integer"
                }
            } }));
    });
    it("should ignore type aliases that have schema overrides", function () {
        var program = TJS.getProgramFromFiles([(0, path_1.resolve)(BASE + "type-alias-schema-override/main.ts")]);
        var generator = TJS.buildGenerator(program);
        (0, chai_1.assert)(generator !== null);
        if (generator !== null) {
            var schemaOverride = { type: "string" };
            generator.setSchemaOverride("Some", schemaOverride);
            var schema = generator.getSchemaForSymbol("MyObject");
            chai_1.assert.deepEqual(schema, {
                $schema: "http://json-schema.org/draft-07/schema#",
                definitions: {
                    Some: {
                        type: "string",
                    },
                },
                properties: {
                    some: {
                        $ref: "#/definitions/Some",
                    },
                },
                type: "object",
            });
        }
    });
});
describe("schema", function () {
    describe("type aliases", function () {
        assertSchema("type-alias-single", "MyString");
        assertSchema("type-alias-single-annotated", "MyString");
        assertSchema("type-aliases", "MyObject", {
            aliasRef: true,
        });
        assertSchema("type-aliases-fixed-size-array", "MyFixedSizeArray");
        assertSchema("type-aliases-multitype-array", "MyArray");
        assertSchema("type-aliases-local-namsepace", "MyObject", {
            aliasRef: true,
            strictNullChecks: true,
        });
        assertSchema("type-aliases-partial", "MyObject", {
            aliasRef: true,
        });
        assertSchema("type-aliases-alias-ref", "MyAlias", {
            aliasRef: true,
            topRef: false,
        });
        assertSchema("type-aliases-recursive-object-topref", "MyObject", {
            aliasRef: true,
            topRef: true,
        });
        assertSchema("type-alias-or", "MyObject");
        assertSchema("type-literals", "MyObject");
        assertSchema("type-no-aliases-recursive-topref", "MyAlias", {
            aliasRef: false,
            topRef: true,
        });
        assertSchema("type-mapped-types", "MyMappedType");
        assertSchema("type-aliases-tuple-of-variable-length", "MyTuple");
        assertSchema("type-aliases-tuple-with-rest-element", "MyTuple");
        assertRejection("type-alias-never", "MyNever", {}, {}, /Unsupported type: never/);
    });
    describe("enums", function () {
        assertSchema("enums-string", "MyObject");
        assertSchema("enums-number", "MyObject");
        assertSchema("enums-number-initialized", "Enum");
        assertSchema("enums-compiled-compute", "Enum");
        assertSchema("enums-mixed", "MyObject");
        assertSchema("enums-value-in-interface", "MyObject");
    });
    describe("unions and intersections", function () {
        assertSchema("type-union", "MyObject");
        assertSchema("type-intersection", "MyObject", {
            noExtraProps: true,
        });
        assertSchema("type-union-tagged", "Shape");
        assertSchema("type-aliases-union-namespace", "MyModel");
        assertSchema("type-intersection-recursive", "Foo");
        assertSchema("type-intersection-recursive-no-additional", "MyLinkedList", {
            noExtraProps: true,
        });
        assertSchema("type-union-strict-null-keep-description", "MyObject", undefined, {
            strictNullChecks: true,
        });
    });
    describe("no-refs", function () {
        assertSchema("no-ref", "MyModule", {
            ref: false,
            aliasRef: false,
            topRef: false,
            noExtraProps: true,
        });
    });
    describe("annotations", function () {
        assertSchema("annotation-default", "MyObject");
        assertSchema("annotation-ref", "MyObject", {}, undefined, undefined, {
            skipCompile: true,
        });
        assertSchema("annotation-tjs", "MyObject", {
            validationKeywords: ["hide"],
        });
        assertSchema("annotation-id", "MyObject", {}, undefined, undefined);
        assertSchema("annotation-title", "MyObject");
        assertSchema("annotation-items", "MyObject");
        assertSchema("typeof-keyword", "MyObject", { typeOfKeyword: true });
        assertSchema("user-validation-keywords", "MyObject", {
            validationKeywords: ["chance", "important"],
        });
    });
    describe("generics", function () {
        assertSchema("generic-simple", "MyObject");
        assertSchema("generic-arrays", "MyObject");
        assertSchema("generic-multiple", "MyObject");
        assertSchema("generic-multiargs", "MyObject");
        assertSchema("generic-anonymous", "MyObject");
        assertSchema("generic-recursive", "MyObject", {
            topRef: true,
        });
        if (+typescript_1.versionMajorMinor < 3.7) {
            assertSchema("generic-hell", "MyObject");
        }
    });
    describe("comments", function () {
        assertSchema("comments", "MyObject");
        assertSchema("comments-comment", "MyObject");
        assertSchema("comments-override", "MyObject");
        assertSchema("comments-imports", "MyObject", {
            aliasRef: true,
        });
        assertSchema("comments-from-lib", "MyObject");
        assertSchema("comments-inline-tags", "MyObject");
    });
    describe("types", function () {
        assertSchema("force-type", "MyObject");
        assertSchema("force-type-imported", "MyObject");
        assertSchema("type-anonymous", "MyObject");
        assertSchema("type-primitives", "MyObject");
        assertSchema("type-nullable", "MyObject");
        assertSchema("any-unknown", "MyObject");
        assertSchema("never", "Never");
    });
    describe("class and interface", function () {
        assertSchema("class-single", "MyObject");
        assertSchema("class-extends", "MyObject");
        assertSchema("abstract-class", "AbstractBase");
        assertSchema("abstract-extends", "MyObjectFromAbstract");
        assertSchema("interface-single", "MyObject");
        assertSchema("interface-multi", "MyObject");
        assertSchema("interface-extends", "MyObject");
        assertSchema("interface-recursion", "MyObject", {
            topRef: true,
        });
        assertSchema("module-interface-single", "MyObject");
        assertSchema("ignored-required", "MyObject");
        assertSchema("default-properties", "MyObject");
    });
    describe("maps and arrays", function () {
        assertSchema("array-readonly", "MyReadOnlyArray");
        assertSchema("array-types", "MyArray");
        assertSchema("array-empty", "MyEmptyArray");
        assertSchema("map-types", "MyObject");
        assertSchema("extra-properties", "MyObject");
        assertSchema("numeric-keys-and-others", "NumericKeysAndOthers");
    });
    describe("string literals", function () {
        assertSchema("string-literals", "MyObject");
        assertSchema("string-literals-inline", "MyObject");
    });
    describe("template string", function () {
        assertSchema("string-template-literal", "MyObject");
    });
    describe("custom dates", function () {
        assertSchema("custom-dates", "foo.Bar");
    });
    describe("dates", function () {
        assertSchema("dates", "MyObject");
        assertRejection("dates", "MyObject", {
            rejectDateType: true,
        });
    });
    describe("namespaces", function () {
        assertSchema("namespace", "Type");
        assertSchema("namespace-deep-1", "RootNamespace.Def");
        assertSchema("namespace-deep-2", "RootNamespace.SubNamespace.HelperA");
    });
    describe("uniqueNames", function () {
        assertSchemas("unique-names", "MyObject", {
            uniqueNames: true,
        });
        assertRejection("unique-names", "MyObject", {
            uniqueNames: true,
        });
        assertSchema("unique-names-multiple-subdefinitions", "MyObject", {
            uniqueNames: true,
        });
    });
    describe("undefined", function () {
        assertSchema("undefined-property", "MyObject");
        assertRejection("type-alias-undefined", "MyUndefined", undefined, undefined, /Not supported: root type undefined/);
    });
    describe("other", function () {
        assertSchema("array-and-description", "MyObject");
        assertSchema("optionals", "MyObject");
        assertSchema("optionals-derived", "MyDerived");
        assertSchema("strict-null-checks", "MyObject", undefined, {
            strictNullChecks: true,
        });
        assertSchema("imports", "MyObject");
        assertSchema("generate-all-types", "*");
        assertSchema("private-members", "MyObject", {
            excludePrivate: true,
        });
        assertSchema("builtin-names", "Ext.Foo");
        assertSchema("user-symbols", "*");
        assertSchemas("argument-id", "MyObject", {
            id: "someSchemaId",
        });
        assertSchemas("type-default-number-as-integer", "*", {
            defaultNumberType: "integer",
        });
        assertSchema("prop-override", "MyObject");
        assertSchema("symbol", "MyObject");
    });
    describe("object index", function () {
        assertSchema("object-numeric-index", "IndexInterface");
        assertSchema("object-numeric-index-as-property", "Target", { required: false });
    });
    describe("recursive type", function () {
        assertSchema("type-recursive", "TestChildren");
    });
    describe("typeof globalThis", function () {
        assertSchema("type-globalThis", "Test");
    });
    describe("key in key of", function () {
        assertSchema("key-in-key-of-single", "Main");
        assertSchema("key-in-key-of-multi", "Main");
        assertSchema("key-in-key-of-multi-underscores", "Main");
    });
});
describe("tsconfig.json", function () {
    it("should read files from tsconfig.json", function () {
        var program = TJS.programFromConfig((0, path_1.resolve)(BASE + "tsconfig/tsconfig.json"));
        var generator = TJS.buildGenerator(program);
        (0, chai_1.assert)(generator !== null);
        chai_1.assert.instanceOf(generator, TJS.JsonSchemaGenerator);
        if (generator !== null) {
            chai_1.assert.doesNotThrow(function () { return generator.getSchemaForSymbol("IncludedAlways"); });
            chai_1.assert.doesNotThrow(function () { return generator.getSchemaForSymbol("IncludedOnlyByTsConfig"); });
            chai_1.assert.throws(function () { return generator.getSchemaForSymbol("Excluded"); });
        }
    });
    it("should support includeOnlyFiles with tsconfig.json", function () {
        var program = TJS.programFromConfig((0, path_1.resolve)(BASE + "tsconfig/tsconfig.json"), [
            (0, path_1.resolve)(BASE + "tsconfig/includedAlways.ts"),
        ]);
        var generator = TJS.buildGenerator(program);
        (0, chai_1.assert)(generator !== null);
        chai_1.assert.instanceOf(generator, TJS.JsonSchemaGenerator);
        if (generator !== null) {
            chai_1.assert.doesNotThrow(function () { return generator.getSchemaForSymbol("IncludedAlways"); });
            chai_1.assert.throws(function () { return generator.getSchemaForSymbol("Excluded"); });
            chai_1.assert.throws(function () { return generator.getSchemaForSymbol("IncludedOnlyByTsConfig"); });
        }
    });
});
describe("Functionality 'required' in annotation", function () {
    assertSchema("annotation-required", "MyObject", {
        tsNodeRegister: true,
    });
});
describe("when reusing a generator", function () {
    it("should not add unrelated definitions to schemas", function () {
        var testProgramPath = BASE + "no-unrelated-definitions/";
        var program = TJS.programFromConfig((0, path_1.resolve)(testProgramPath + "tsconfig.json"));
        var generator = TJS.buildGenerator(program);
        ["MyObject", "MyOtherObject"].forEach(function (symbolName) {
            var expectedSchemaString = (0, fs_1.readFileSync)(testProgramPath + "schema.".concat(symbolName, ".json"), "utf8");
            var expectedSchemaObject = JSON.parse(expectedSchemaString);
            var actualSchemaObject = generator === null || generator === void 0 ? void 0 : generator.getSchemaForSymbol(symbolName);
            chai_1.assert.deepEqual(actualSchemaObject, expectedSchemaObject, "The schema for ".concat(symbolName, " is not as expected"));
        });
    });
    it("should not add unrelated schemaOverrides to schemas", function () {
        var testProgramPath = BASE + "no-unrelated-definitions/";
        var program = TJS.programFromConfig((0, path_1.resolve)(testProgramPath + "tsconfig.json"));
        var generator = TJS.buildGenerator(program);
        var schemaOverride = { type: "string" };
        generator === null || generator === void 0 ? void 0 : generator.setSchemaOverride("SomeOtherDefinition", schemaOverride);
        [
            { symbolName: "MyObject", schemaName: "MyObject" },
            { symbolName: "MyOtherObject", schemaName: "MyOtherObjectWithOverride" },
        ].forEach(function (_a) {
            var symbolName = _a.symbolName, schemaName = _a.schemaName;
            var expectedSchemaString = (0, fs_1.readFileSync)("".concat(testProgramPath, "schema.").concat(schemaName, ".json"), "utf8");
            var expectedSchemaObject = JSON.parse(expectedSchemaString);
            var actualSchemaObject = generator === null || generator === void 0 ? void 0 : generator.getSchemaForSymbol(symbolName);
            chai_1.assert.deepEqual(actualSchemaObject, expectedSchemaObject, "The schema for ".concat(symbolName, " is not as expected"));
        });
    });
    it("should include all schemaOverrides when generating program schemas", function () {
        var testProgramPath = BASE + "no-unrelated-definitions/";
        var program = TJS.programFromConfig((0, path_1.resolve)("".concat(testProgramPath, "tsconfig.json")));
        var generator = TJS.buildGenerator(program);
        var schemaOverride = { type: "string" };
        generator.setSchemaOverride("UnrelatedDefinition", schemaOverride);
        var expectedSchemaString = (0, fs_1.readFileSync)("".concat(testProgramPath, "schema.program.json"), "utf8");
        var expectedSchemaObject = JSON.parse(expectedSchemaString);
        var actualSchemaObject = TJS.generateSchema(program, "*", {}, undefined, generator);
        chai_1.assert.deepEqual(actualSchemaObject, expectedSchemaObject, "The schema for whole program is not as expected");
    });
});
describe("satisfies keyword - ignore from a \"satisfies\" and build by rally type", function () {
    assertSchema("satisfies-keyword", "Specific");
});
describe("const keyword", function () {
    assertSchema("const-keyword", "Object");
});
describe("constAsEnum option", function () {
    assertSchema("const-as-enum", "MyObject", { constAsEnum: true });
});
//# sourceMappingURL=schema.test.js.map