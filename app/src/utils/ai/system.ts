import templates from './system-prompts';
import templateDrawingElementGeneration from './system-prompts/drawing';

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
  ScrollAgent = 'scrollAgent',
  TextAgent = 'textAgent',
}

export function chooseSystemPrompt(systemMessageChoice: Agents) {
  switch (systemMessageChoice) {
    case Agents.ArrowAgent:
      return (
        templates.code.write +
        templateDrawingElementGeneration +
        templates.arrow
      );
    case Agents.CodeFixAgent:
      return templates.code.write + templates.code.fix;
    case Agents.EllipseAgent:
      return (
        templates.code.write +
        templateDrawingElementGeneration +
        templates.ellipse
      );
    case Agents.FunctionAgent:
      return (
        templates.code.write +
        templateDrawingElementGeneration +
        templates.functionTemplate
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
    case Agents.PolygonAgent:
      return (
        templates.code.write +
        templateDrawingElementGeneration +
        templates.polygon
      );
    case Agents.PreprocessingAgent:
      return templates.preprocessing;
    case Agents.ScrollAgent:
      return (
        templates.code.write +
        templates.scroll
      );
    case Agents.TextAgent:
      return (
        templates.code.write + templateDrawingElementGeneration + templates.text
      );
    default:
      return templates.code.write + templateDrawingElementGeneration;
  }
}