import templates from './system-prompts';
import templateDrawingElementGeneration from './system-prompts/drawing';

export enum Agents {
  DiamondAgent = 'diamondAgent',
  EllipseAgent = 'ellipseAgent',
  RectangleAgent = 'rectangleAgent',
  PreprocessingAgent = 'preprocessingAgent',
  FunctionAgent = 'functionAgent',
  LineAgent = 'lineAgent',
  PointAgent = 'pointAgent',
  TextAgent = 'textAgent',
  LatexAgent = 'latexAgent',
  CodeFixAgent = 'codeFixAgent',
}

export function chooseSystemPrompt(systemMessageChoice: Agents) {
  switch (systemMessageChoice) {
    case Agents.DiamondAgent:
      return  (
        templates.code.write + 
        templateDrawingElementGeneration + 
        templates.diamond
      );
    case Agents.EllipseAgent:
      return  (
        templates.code.write + 
        templateDrawingElementGeneration + 
        templates.ellipse
      );
    case Agents.RectangleAgent:
      return  (
        templates.code.write + 
        templateDrawingElementGeneration + 
        templates.rectangle
      );
    case Agents.PreprocessingAgent:
      return templates.preprocessing;
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
