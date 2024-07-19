import type { CodegenConfig } from '@graphql-codegen/cli';
import * as path from 'path';

const config: CodegenConfig = {
  overwrite: true,
  watch: false,
  schema: [
    path.join(__dirname, 'src/graphql/schemas/**/*.graphql'),
  ],
  generates: {
    'src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-resolvers',
        'typescript-mongodb',
        'typescript-document-nodes',
      ],
    },
  },
};

export default config;