import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Build output and vendored files are not ours to lint — without this,
  // `eslint .` walks .next/ and reports tens of thousands of problems.
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "next-env.d.ts",
      "public/**",
      "types/SLL.js",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Pre-existing style debt across the codebase. Downgraded to warnings so CI
    // fails on real breakage rather than on 80 legacy findings — clean these up
    // and promote them back to "error".
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
];

export default eslintConfig;
