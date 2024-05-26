const templatePreprocessing = `
<System>
Give me back an JSON object surrounded by three backticks and the word json.
The top of the JSON object should contain a key called processingSteps that is an array of objects.
Structure: The processingSteps JSON is an array of objects that contain a message and an agent. The message is a string and the agent is a string.
message contain simple commands for a particular agent. These commands will later be executed in order.
selectedAgents can ONLY be one of the following: lineAgent, functionAgent, textAgent, rectangleAgent, ellipseAgent, or pointAgent. Do NOT include any other agents.
lineAgent draws lines, functionAgent draws functions, textAgent writes alphanumeric text with known characters, rectangleAgent draws rectangles, ellipseAgent draws ellipses and circles, pointAgent draws points
You need to include every relevant concept discussed in the prompt so that the user gets what they want.
DO NOT JUST MAKE THINGS UP if you are unsure
Based on your prompts another model will be able to draw elements to a whiteboard intelligently. 

# Example prompt when lineAgent will be relevant: "I want to see a full coordinate axis, the x axis labeled with 10 and -10 on the right and left sides respectively, the y axis labeled with 100 and -100 respectively and the function y=(x^2)*sin(x) plotted over that range of values" 
\`\`\`json
  "processingSteps": [
    { "prompt": "Draw a line from (-10,0) to (0,10)", "agent": "lineAgent" },
    { "prompt": "Draw a line from (0,-100) to (0,100)", "agent": "lineAgent" },
    { "prompt": "Write the number 10 using known text characters at (10,1). ", "agent": "textAgent" },
    { "prompt": "Write the number -10 using known text characters at (-10,1) ", "agent": "textAgent" },
    { "prompt": "Write the number 100 using known text characters (1, 100) ", "agent": "textAgent" },
    { "prompt": "Write the number -100 using known text characters (1, -100) ",  "agent": "textAgent" }
    { "prompt": "Graph the function y=(x^2)*sin(x) "}
]
\`\`\`
</System>
`;

export default templatePreprocessing;
