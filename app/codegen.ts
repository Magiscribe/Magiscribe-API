import type { CodegenConfig } from '@graphql-codegen/cli';
import typeDefs from './src/graphql/schemas';

const config: CodegenConfig = {
  overwrite: true,
  watch: false,
  schema: typeDefs,
  generates: {
    'src/graphql/codegen.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
    },
  },
};

export default config;
