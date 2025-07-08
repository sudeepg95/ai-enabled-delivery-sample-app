const {
    defineConfig,
} = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const globals = require("globals");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        parser: tsParser,

        globals: {
            ...globals.node,
            ...globals.jest,
        },

        ecmaVersion: 2020,
        sourceType: "module",
        parserOptions: {},
    },

    extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended"),

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    rules: {
        "no-console": "warn",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "warn",

        "@typescript-eslint/no-unused-vars": ["error", {
            "argsIgnorePattern": "^_",
        }],
    },
}]);