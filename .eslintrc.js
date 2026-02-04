export default {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": "warn",
    "no-unused-vars": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
};
