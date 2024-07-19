import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadTypedefsSync } from '@graphql-tools/load';
import { mergeSchemas } from '@graphql-tools/schema';
import * as path from 'path';
import { authDirectiveTransformer, authDirectiveTypeDefs } from './directives';
import fs from 'fs';

// Load and merge GraphQL schemas and resolvers, then apply custom directives.

/*=============================== Load Resolvers ==============================*/

// Directory containing resolver files.
const resolversDirectory = path.join(__dirname, './resolvers');

// Read all files in the resolvers directory.
const resolverFiles = fs.readdirSync(resolversDirectory);

// Import resolver files dynamically, filtering out non-TypeScript or non-JavaScript files.
// This ensures only relevant files are loaded as resolvers.
const resolvers = resolverFiles
  .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts') || file.endsWith('.js'))
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  .map(file => require(path.join(resolversDirectory, file)).default);

/*=============================== Load Type Definitions ==============================*/

// Load GraphQL schema files from the schemas directory.
const schemaSources = loadTypedefsSync(path.join(__dirname, './schemas/**/*.graphql'), {
  loaders: [new GraphQLFileLoader()],
});

// Extract document nodes from loaded schema sources.
const schemaDocuments = schemaSources.map(source => source.document!);

// Combine custom directive type definitions with loaded schema documents.
const typeDefs = [
  authDirectiveTypeDefs,
  ...schemaDocuments,
];

/*=============================== Merge and Transform Schema ==============================*/

// Merge type definitions and resolvers into a single schema.
let schema = mergeSchemas({ typeDefs, resolvers });

// Apply custom directive transformers to the merged schema.
// This step integrates custom logic or validation defined in directives.
schema = authDirectiveTransformer(schema);

export { resolvers, schema };