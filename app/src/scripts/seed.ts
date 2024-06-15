import database from '@database';
import { Agent, Capability, Prompt } from '@database/models/agent';
import log from '@log';
import templates from './system-prompts';

export enum Capabilities {
  ArrowCapability = 'ArrowCapability',
  CodeFixCapability = 'CodeFixCapability',
  EllipseCapability = 'EllipseCapability',
  FunctionCapability = 'FunctionCapability',
  LatexCapability = 'LatexCapability',
  LineCapability = 'LineCapability',
  PointCapability = 'PointCapability',
  PolygonCapability = 'PolygonCapability',
  AppStateCapability = 'AppStateCapability',
  ScrollCapability = 'ScrollCapability',
  ZoomCapability = 'ZoomCapability',
  TextCapability = 'TextCapability',
}

/**
 * Initializes the database with the default agents and capabilities.
 * This function should be called only once, when the server is started.
 */
export async function initialize() {
  await Agent.deleteMany({});
  await Capability.deleteMany({});
  await Prompt.deleteMany({});

  await Promise.all(
    Object.entries(templates).map(([key, text]) =>
      Prompt.create({
        name: key,
        text,
      }),
    ),
  );

  // Function to convert a string from camelCase to Title Case
  function camelToTitleCase(str: string) {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  }

  const capabilities = [
    {
      name: camelToTitleCase(Capabilities.ArrowCapability),
      alias: Capabilities.ArrowCapability,
      prompts: ['drawing', 'writePython', 'arrow'],
    },
    {
      name: camelToTitleCase(Capabilities.EllipseCapability),
      alias: Capabilities.EllipseCapability,
      prompts: ['drawing', 'writePython', 'ellipse'],
    },
    {
      name: camelToTitleCase(Capabilities.PolygonCapability),
      alias: Capabilities.PolygonCapability,
      prompts: ['drawing', 'writePython', 'polygon'],
    },
    {
      name: camelToTitleCase(Capabilities.FunctionCapability),
      alias: Capabilities.FunctionCapability,
      prompts: ['drawing', 'functionTemplate', 'writePython'],
    },
    {
      name: camelToTitleCase(Capabilities.LineCapability),
      alias: Capabilities.LineCapability,
      prompts: ['drawing', 'writePython', 'line'],
    },
    {
      name: camelToTitleCase(Capabilities.PointCapability),
      alias: Capabilities.PointCapability,
      prompts: ['drawing', 'writePython', 'point'],
    },
    {
      name: camelToTitleCase(Capabilities.TextCapability),
      alias: Capabilities.TextCapability,
      prompts: ['drawing', 'writePython', 'text'],
    },
    {
      name: camelToTitleCase(Capabilities.CodeFixCapability),
      alias: Capabilities.CodeFixCapability,
      prompts: ['writePython', 'fixPython'],
    },
    {
      name: camelToTitleCase(Capabilities.ScrollCapability),
      alias: Capabilities.ScrollCapability,
      prompts: ['writePython', 'appState', 'scroll'],
    },
    {
      name: camelToTitleCase(Capabilities.ZoomCapability),
      alias: Capabilities.ZoomCapability,
      prompts: ['writePython', 'appState', 'zoom'],
    },
  ];

  await Promise.all(
    capabilities.map(async (capability) => {
      await Capability.create({
        name: capability.name,
        alias: capability.alias,
        description: `This is a description for ${capability.name} agent.`,
        prompts: await Promise.all(
          capability.prompts.map(async (prompt) =>
            Prompt.findOne({ name: prompt }),
          ),
        ),
      });
    }),
  );

  await Agent.create({
    name: 'Default Agent',
    description: 'This is a description for the default agent.',
    reasoningPrompt: templates.preprocessing,
    capabilities: await Capability.find({}),
  });
}

async function seed() {
  await database.init();
  await initialize();
}

log.info('Starting seeding...');
seed()
  .then(() => {
    log.info('Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    log.error(error);
    process.exit(1);
  });
