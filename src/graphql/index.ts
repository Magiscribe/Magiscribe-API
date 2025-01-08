import { mergeSchemas } from '@graphql-tools/schema';
import { authDirectiveTransformer } from './directives';
import resolvers from './resolvers';
import { typeDefs } from './schema';

/*=============================== Merge and Transform Schema ==============================*/

// Merge type definitions and resolvers into a single schema.
let schema = mergeSchemas({ typeDefs, resolvers });

// Apply custom directive transformers to the merged schema.
// This step integrates custom logic or validation defined in directives.
schema = authDirectiveTransformer(schema);

export { resolvers, schema };
