// Configuración de ESLint (formato plano). https://eslint.org/docs/latest/use/configure/
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    ignores: ['.output/', '.wxt/', 'node_modules/', 'coverage/'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    files: ['src/**/*.tsx'],
    extends: [reactHooks.configs.flat.recommended],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // Seguridad: prohibido ejecutar código dinámico o inyectar HTML sin sanear.
      'no-eval': 'error',
      'no-implied-eval': 'off',
      '@typescript-eslint/no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-properties': [
        'error',
        { property: 'innerHTML', message: 'Usa textContent o nodos del DOM.' },
        { property: 'outerHTML', message: 'Usa nodos del DOM.' },
        { property: 'insertAdjacentHTML', message: 'Usa nodos del DOM.' },
      ],
      // Privacidad: ninguna funcionalidad debe realizar peticiones de red.
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Veilix no realiza peticiones de red.' },
        { name: 'XMLHttpRequest', message: 'Veilix no realiza peticiones de red.' },
        { name: 'WebSocket', message: 'Veilix no realiza peticiones de red.' },
        { name: 'EventSource', message: 'Veilix no realiza peticiones de red.' },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
);
