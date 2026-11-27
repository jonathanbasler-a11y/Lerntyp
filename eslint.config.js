import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/dist-live/**', '**/dev-dist/**', '**/node_modules/**', '**/playwright-report/**', '**/test-results/**', 'scripts/test/fixtures/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.node } } },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: '19' } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      // Kein hartkodierter UI-Text: alles kommt über t() aus data/texte/de.json.
      'react/jsx-no-literals': ['error', { noStrings: true, ignoreProps: true }],
      'react/prop-types': 'off',
    },
  },
);
