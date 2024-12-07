import fs from 'fs';
import { Model } from 'mongoose';
import path from 'path';

import database from '../src/database';
import {
  Agent,
  Capability,
  Collection,
  Prompt,
} from '../src/database/models/agent';
import log from '../src/log';

(async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collections: { model: Model<any>; name: string }[] = [
    { model: Agent, name: 'agents' },
    { model: Capability, name: 'capabilities' },
    { model: Prompt, name: 'prompts' },
    { model: Collection, name: 'collections' },
  ];

  try {
    await database.init();

    const dataDir = path.join('seed', 'data', 'default');
    fs.mkdirSync(dataDir, { recursive: true });

    await Promise.all(
      collections.map(async ({ model, name }) => {
        const data = await model.find();
        fs.writeFileSync(
          path.join(dataDir, `${name}.json`),
          JSON.stringify(data, null, 2),
        );
      }),
    );

    log.info('Exported data from MongoDB.');
  } catch (error) {
    log.error(error);
    process.exit(1);
  }

  process.exit(0);
})();
