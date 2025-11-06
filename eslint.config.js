import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        chrome: 'readonly',
        TomSelect: 'readonly',
        Storage: 'readonly',
        LLM: 'readonly',
      },
    },
    rules: {
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
  {
    ignores: ['node_modules/**', 'tmp/**', 'docs/**', 'src/vendor/**'],
  },
]
