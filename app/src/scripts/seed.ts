import database from '@database';
import { Agent, Capability } from '@database/models/agent';
import log from '@log';
import templates from './system-prompts';

export enum Agents {
  ArrowAgent = 'arrowAgent',
  CodeFixAgent = 'codeFixAgent',
  EllipseAgent = 'ellipseAgent',
  FunctionAgent = 'functionAgent',
  LatexAgent = 'latexAgent', //To do: Decide if we want to support this agent on the frontend or delete it.
  LineAgent = 'lineAgent',
  PointAgent = 'pointAgent',
  PolygonAgent = 'polygonAgent',
  PreprocessingAgent = 'preprocessingAgent',
  AppStateAgent = 'appStateAgent',
  ScrollAgent = 'scrollAgent',
  ZoomAgent = 'zoomAgent',
  TextAgent = 'textAgent',
}

/**
 * Initializes the database with the default agents and capabilities.
 * This function should be called only once, when the server is started.
 */
export async function initializeAgents() {
  await Agent.deleteMany({});
  await Capability.deleteMany({});

  await Promise.all(
    Object.entries(templates).map(([key, prompt]) =>
      Capability.create({
        name: key,
        description: `This is a description for ${key} capability.`,
        prompt,
      }),
    ),
  );

  // Function to convert a string from camelCase to Title Case
  function camelToTitleCase(str: string) {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  }

  const agents = [
    {
      name: camelToTitleCase(Agents.ArrowAgent),
      alias: Agents.ArrowAgent,
      caps: ['drawing', 'writePython', 'arrow'],
    },
    {
      name: camelToTitleCase(Agents.EllipseAgent),
      alias: Agents.EllipseAgent,
      caps: ['drawing', 'writePython', 'ellipse'],
    },
    {
      name: camelToTitleCase(Agents.PolygonAgent),
      alias: Agents.PolygonAgent,
      caps: ['drawing', 'writePython', 'polygon'],
    },
    {
      name: camelToTitleCase(Agents.PreprocessingAgent),
      alias: Agents.PreprocessingAgent,
      caps: ['preprocessing'],
    },
    {
      name: camelToTitleCase(Agents.FunctionAgent),
      alias: Agents.FunctionAgent,
      caps: ['drawing', 'functionTemplate', 'writePython'],
    },
    {
      name: camelToTitleCase(Agents.LineAgent),
      alias: Agents.LineAgent,
      caps: ['drawing', 'writePython', 'line'],
    },
    {
      name: camelToTitleCase(Agents.PointAgent),
      alias: Agents.PointAgent,
      caps: ['drawing', 'writePython', 'point'],
    },
    {
      name: camelToTitleCase(Agents.TextAgent),
      alias: Agents.TextAgent,
      caps: ['drawing', 'writePython', 'text'],
    },
    {
      name: camelToTitleCase(Agents.CodeFixAgent),
      alias: Agents.CodeFixAgent,
      caps: ['writePython', 'fixPython'],
    },
    {
      name: camelToTitleCase(Agents.ScrollAgent),
      alias: Agents.ScrollAgent,
      caps: ['writePython', 'appState', 'scroll'],
    },
    {
      name: camelToTitleCase(Agents.ZoomAgent),
      alias: Agents.ZoomAgent,
      caps: ['writePython', 'appState', 'zoom'],
    },
  ];

  await Promise.all(
    agents.map(async (agent) => {
      await Agent.create({
        name: agent.name,
        alias: agent.alias,
        description: `This is a description for ${agent.name} agent.`,
        capabilities: await Promise.all(
          agent.caps.map(async (cap) => Capability.findOne({ name: cap })),
        ),
      });
    }),
  );
}

async function seed() {
  await database.init();
  await initializeAgents();
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
