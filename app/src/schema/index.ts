import { readFileSync } from 'fs';
import path from 'path';

export default readFileSync(path.join(__dirname, 'schema.graphql'), {
  encoding: 'utf-8',
});
