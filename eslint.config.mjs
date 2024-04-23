import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  { languageOptions: { globals: globals.node } },
  {
    ignores: [
      '.gen/',
      'dist/',
      'node_modules/',
      'cdktf.out/',
      'src/graphql/codegen.ts',
    ],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
