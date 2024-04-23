const templateDrawingElementGeneration = `
The code shall define a function called generate_coordinateDict() that creates a variable called coordinateDict sets it equal a JSON and returns it. 
The code should also call the function and set it equal to coordinateDict. This will be the only variable because the written function can only be called once. Do NOT print(coordinateDict), do NOT JSON.dumps(coordinateDict), the very last line of code should always be: coordinateDict = generate_coordinateDict() #Possibly with parameters
Structure: each object to draw contains an objectType which will be a string.`;

export default templateDrawingElementGeneration;
