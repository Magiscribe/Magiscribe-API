import { mergeSchemas } from '@graphql-tools/schema';

import { authDirectiveTypeDefs } from './directives';
import agent from './schemas/agent';
import assets from './schemas/assets';
import audio from './schemas/audio';
import inquiry from './schemas/inquiry';
import predictions from './schemas/predictions';
import users from './schemas/users';

const filters = `#graphql
    input FloatFilter {
        eq: Float      # Exact match
        gt: Float      # Greater than
        gte: Float     # Greater than or equal
        lt: Float      # Less than
        lte: Float     # Less than or equal
    }

    input StringFilter {
        eq: String         # Exact match
        contains: String   # Contains text (case-insensitive)
        startsWith: String # Starts with text
        endsWith: String   # Ends with text
    }
`;

/*=============================== Load Type Definitions ==============================*/

// Combine custom directive type definitions with loaded schema documents.
const typeDefs = [
  authDirectiveTypeDefs,
  filters,
  agent,
  assets,
  audio,
  inquiry,
  predictions,
  users,
];

const schema = mergeSchemas({
  typeDefs,
});

export { typeDefs, schema };
