import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config({
  ignores: ["public/*"],
  extends: [eslint.configs.recommended, ...tseslint.configs.strict, ...tseslint.configs.stylistic, prettierConfig],
});
