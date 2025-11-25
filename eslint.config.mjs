import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2023,
      sourceType: "module",
    },
    plugins: ["@eslint/js"],
    extends: ["eslint:recommended"],
    rules: {
      "no-unused-vars": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    files: ["**/*.{ts,mts,cts}"],
    extends: ["plugin:@typescript-eslint/recommended"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/eqeqeq": ["error", "always"],
    },
  },
]);
