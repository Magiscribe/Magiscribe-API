import { makeRequest } from '.';
import templates from './templates';
import templateDrawingElementGeneration from './templates/drawing';

export enum Agents {
  PreprocessingAgent = 'preprocessingAgent',
  FunctionAgent = 'functionAgent',
  LineAgent = 'lineAgent',
  PointAgent = 'pointAgent',
  TextAgent = 'textAgent',
  LatexAgent = 'latexAgent',
  CodeFixAgent = 'codeFixAgent',
}

export async function executePrediction({
  prompt,
  agent,
}: {
  prompt: string;
  agent: Agents;
}): Promise<string> {
  const promptTemplate = chooseSystemPrompt(agent);
  const result = await makeRequest({
    system: promptTemplate,
    prompt,
  });

  return result;
}

export function chooseSystemPrompt(systemMessageChoice: Agents) {
  switch (systemMessageChoice) {
    case Agents.PreprocessingAgent:
      return templates.preprocessing;
    case Agents.FunctionAgent:
      return (
        templates.code.write +
        templateDrawingElementGeneration +
        templates.point
      );
    case Agents.LineAgent:
      return (
        templates.code.write + templateDrawingElementGeneration + templates.line
      );
    case Agents.PointAgent:
      return (
        templates.code.write +
        templateDrawingElementGeneration +
        templates.point
      );
    case Agents.TextAgent:
      return (
        templates.code.write + templateDrawingElementGeneration + templates.text
      );
    case Agents.CodeFixAgent:
      return templates.code.write + templates.code.fix;
    default:
      return templates.code.write + templateDrawingElementGeneration;
  }
}

export function cleanPythonCode(code: string): string {
  // Regular expression to match ```python at the beginning and ``` at the end of the string
  const codeBlockRegex = /```python\n([\s\S]*?)\n```/;

  // Extract the code block between ```python and ```
  const match = code.match(codeBlockRegex);
  if (match && match[1]) {
    code = match[1];
  }

  // Rename coordinate_dict to coordinateDict
  code = code.replace(/coordinate_dict/g, 'coordinateDict');

  // Rename prompt_dict to promptDict
  code = code.replace(/prompt_dicts/g, 'promptDict');

  return code;
}

export function cleanJsonCode(code: string): string {
  // Regular expression to match ```json at the beginning and ``` at the end of the string
  const codeBlockRegex = /```json\n([\s\S]*?)\n```/;

  // Extract the code block between ```json and ```
  const match = code.match(codeBlockRegex);
  if (match && match[1]) {
    code = match[1];
  }

  return code;
}
