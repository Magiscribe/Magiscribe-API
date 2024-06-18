import database from '../src/database';
import { Agent, Capability, Prompt } from '../src/database/models/agent';
import log from '../src/log';
import fs from 'fs';
import { Model } from 'mongoose';
import path from 'path';

(async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collections: { model: Model<any>; name: string }[] = [
    { model: Agent, name: 'agents' },
    { model: Capability, name: 'capabilities' },
    { model: Prompt, name: 'prompts' },
  ];

  try {
    await database.init();

    const dataDir = path.join('seed', 'data');
    const dirs = fs
      .readdirSync(dataDir)
      .filter((entry) => fs.lstatSync(path.join(dataDir, entry)).isDirectory());
    const latestDir = dirs.sort().reverse()[0];
    const seedDir = path.join(dataDir, latestDir);

    await Promise.all(
      collections.map(async ({ model, name }) => {
        const data = JSON.parse(
          fs.readFileSync(path.join(seedDir, `${name}.json`), 'utf-8'),
        );
        await model.deleteMany({});
        await model.insertMany(data);
      }),
    );

    log.info(`Loaded data from ${seedDir}`);
    log.info('Loaded data into MongoDB.');
  } catch (error) {
    log.error(error);
    process.exit(1);
  }

  process.exit(0);
})();
