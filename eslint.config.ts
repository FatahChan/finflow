import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist', '.nitro/**', '.output/**', '.vercel/**']),
  {
    files: ['src/**/*.{ts,tsx}', 'vite.config.ts', 'workbox-generate.ts'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      tseslint.configs.strictTypeChecked
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ['./tsconfig.app.json', './tsconfig.node.json', './tsconfig.json']
      }
    },
    rules:{
      "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "args": "all",
        "argsIgnorePattern": "^_",
        "caughtErrors": "all",
        "caughtErrorsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }
    ],
    "@typescript-eslint/only-throw-error": "off"
    }
  },
  {
    files: ['**/instant.schema.ts'],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    }
  },
  {
    files: ['src/components/ui/**.tsx'],
    rules: {
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-unsafe-argument": "off"
    }
  }
])
