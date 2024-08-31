module.exports = {
  parserOptions: {
    extraFileExtensions: ['.svelte']
  },
  extends: [
    'eslint:recommended',
    'plugin:svelte/recommended',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier'
  ],
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'svelte/no-unused-svelte-ignore': 'off',
    'svelte/valid-compile': ['error', { ignoreWarnings: true }],
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'semi-style': ['error', 'last']
  },
  globals: {
    $$Generic: 'readonly'
  }
};
