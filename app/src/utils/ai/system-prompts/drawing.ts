const templateDrawingElementGeneration = `
The code shall define a function called generate_coordinateDict() that creates a variable called coordinateDict sets it equal a JSON and returns it. 
The code should also call the function and set it equal to coordinateDict. This will be the only variable because the written function can only be called once. Do NOT print(coordinateDict), do NOT JSON.dumps(coordinateDict), the very last line of code should always be: coordinateDict = generate_coordinateDict() #Possibly with parameters
This JSON also contains a textResponse which is a succinct description of what this is for accessibility purposes when line, freedraw, ellipse, rectangle, or diamond is the object to be rendered for text object type
 
Example coordinateDict Structure:
{
    "elementProperties": {
      "type": "freedraw" | "line" | "text" | "rectangle" | "ellipse" | "diamond", #required
      "opacity": number, #optional, from 0 (perfectly transparent) to 100 (perfectly opaque)
      "strokeWidth": number, #optional, from 0 (impossibly thin) to 3 (very thick)
      "strokeColor": string #optional, 6 digit HTML Hex code starting with a # example #000000
    },
    "startCoordinates": [number, number], #required
    "relativeCoordinates": [number, number][], #required for freedraw and line and rectangle and ellipse and diamond
    "textResponse": "Brief text description" #required
  }
`;

export default templateDrawingElementGeneration;
