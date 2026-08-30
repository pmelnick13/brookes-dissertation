// this uses the standard next.js checks for the project
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // start with the normal next.js and typescript rules
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // generated folders do not need to be checked
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
