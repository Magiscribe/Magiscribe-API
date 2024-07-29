import { mergeSchemas } from '@graphql-tools/schema';
import { authDirectiveTransformer, authDirectiveTypeDefs } from './directives';
import resolvers from './resolvers';
import schemas from './schemas';

/*=============================== Load Type Definitions ==============================*/

// Combine custom directive type definitions with loaded schema documents.
const typeDefs = [authDirectiveTypeDefs, ...schemas];

/*=============================== Merge and Transform Schema ==============================*/

// Merge type definitions and resolvers into a single schema.
let schema = mergeSchemas({ typeDefs, resolvers });

// Apply custom directive transformers to the merged schema.
// This step integrates custom logic or validation defined in directives.
schema = authDirectiveTransformer(schema);

export { resolvers, schema };
