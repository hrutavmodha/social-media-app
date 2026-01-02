import globals from "globals";
import pluginJs from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { fixupConfigRules } from "@eslint/compat";
import pluginImport from "eslint-plugin-import";


export default [
  {
    ignores: ["eslint.config.js"],
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    settings: {
      react: {
        version: "detect", // Automatically detect the React version
      },
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
        project: [
          "./tsconfig.json",
          "./tsconfig.app.json",
          "./tsconfig.node.json",
        ],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: true,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: fixupConfigRules(pluginReact),
      "react-hooks": fixupConfigRules(pluginReactHooks),
      import: fixupConfigRules(pluginImport),
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...fixupConfigRules(pluginReact.configs.recommended).rules,
      ...fixupConfigRules(pluginReactHooks.configs.recommended).rules,
      ...fixupConfigRules(pluginImport.configs.recommended).rules,
      "react/react-in-jsx-scope": "off",
      "no-undef": "off", // Disable ESLint's core no-undef, as TypeScript will handle this
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];
