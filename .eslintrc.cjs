module.exports = {
    root: true,
    env: { browser: true, es2021: true, node: true },
    extends: [
          "eslint:recommended",
          "plugin:@typescript-eslint/recommended",
          "plugin:react-hooks/recommended",
        ],
    parser: "@typescript-eslint/parser",
    parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
    plugins: ["react-refresh"],
    ignorePatterns: ["dist", ".eslintrc.cjs", "vite.config.ts"],
    rules: {
          "react-refresh/only-export-components": "off",
          "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
          "@typescript-eslint/no-explicit-any": "warn",
    },
};
