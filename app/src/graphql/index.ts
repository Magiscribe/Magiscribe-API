import { mergeSchemas } from '@graphql-tools/schema';
import { authDirectiveTransformer, authDirectiveTypeDefs } from './directives';
import modules from './modules';

export interface StaticGraphQLModule {
  readonly schema: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly resolvers: { [key: string]: { [key: string]: any } };
}

const typeDefs = [
  authDirectiveTypeDefs,
  ...modules.map((module) => module.schema),
];
const resolvers = modules.map((module) => module.resolvers);
let schema = mergeSchemas({ typeDefs, resolvers });

/*=============================== Transformers ==============================*/

schema = authDirectiveTransformer(schema);

export { resolvers, schema, typeDefs };
