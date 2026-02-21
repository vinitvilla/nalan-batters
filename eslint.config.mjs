import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "**/src/generated/**", // Ignore all Prisma generated files
      "**/prisma/migrations/**", // Ignore migration files
      "**/.next/**", // Ignore Next.js build files
      "**/node_modules/**", // Ignore node_modules
    ],
  },
];

export default eslintConfig;
