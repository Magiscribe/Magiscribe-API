const templatePreprocessing = `
<System>
Give me back a JSON object surrounded by three backticks and the word json.
The top of the JSON object should contain a key called processingSteps that is an array of objects.
Structure: The processingSteps JSON is an array of objects that contain a message, an agent, and context. The message, agent, and context are all strings.
message contains simple commands for a particular agent. These commands will later be executed in order.
selected agents can ONLY be one of the following: lineAgent, functionAgent, textAgent, rectangleAgent, ellipseAgent, diamondAgent, arrowAgent, or pointAgent. Do NOT include any other agents.
lineAgent draws lines, functionAgent draws functions, textAgent writes alphanumeric text with known characters, rectangleAgent draws rectangles, ellipseAgent draws ellipses and circles, diamondAgent draws diamonds, arrowAgent draws both unidirectional and bidrectional arrows, pointAgent draws points.
context will contain startX, startY, xMin, xMax, yMin, yMax, graphScaleX, and graphScaleY
You need to include every relevant concept in the prompt so that the user gets what they want including color and specific attributes for each object.
Based on your prompts another model will be able to draw elements to a whiteboard intelligently.

# Example 1:
"context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-100, yMax=100, graphScaleX=1000, graphScaleY=1000"
# Prompt: "I want to see a full coordinate axis with the x and y axes labeled" 
# Note: The x axis is a line from (xMin,0) to (xMax,0), the y axis is a line from (0,yMin) to (0,yMax), 
# Note 2: The text labels are also derived from the context. xMin at (xMin,0), xMax at (xMax,0), yMin at (0,yMin), yMax at (0,yMax)
\`\`\`json
  {"processingSteps": [
    { "prompt": "Draw a line from (-10,0) to (10,0)", "agent": "lineAgent", "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-100, yMax=100, graphScaleX=1000, graphScaleY=1000"},
    { "prompt": "Draw a line from (0,-100) to (0,100)", "agent": "lineAgent", "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-100, yMax=100, graphScaleX=1000, graphScaleY=1000"},
    { "prompt": "Write the number 10 using known text characters at (10,0)", "agent": "textAgent", "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-100, yMax=100, graphScaleX=1000, graphScaleY=1000"},
    { "prompt": "Write the number -10 using known text characters at (-10,0)", "agent": "textAgent", "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-100, yMax=100, graphScaleX=1000, graphScaleY=1000"},
    { "prompt": "Write the number 100 using known text characters at (0, 100)", "agent": "textAgent", "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-100, yMax=100, graphScaleX=1000, graphScaleY=1000"},
    { "prompt": "Write the number -100 using known text characters at (0, -100)", "agent": "textAgent", "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-100, yMax=100, graphScaleX=1000, graphScaleY=1000"},
  ]}
\`\`\`

# Example 2:
"context": "startX=90, startY=280, xMin=0, xMax=60, yMin=0, yMax=100, graphScaleX=420, graphScaleY=750"
# Prompt when rectangleAgent and ellipseAgent will be relevant: "Draw a rectangle from (10,10), (10, 40), (40,10), (40,40) and a thick ellipse centered at (50,50) with a radius of 20 units."
# Note: The graph scales do not
\`\`\`json
  {"processingSteps": [
    { "prompt": "Draw a rectangle from (10,10), (10, 40), (40,10), (40,40)", "agent": "rectangleAgent", "context": "startX=90, startY=280, xMin=0, xMax=60, yMin=0, yMax=100, graphScaleX=420, graphScaleY=750"},
    { "prompt": "Draw a thick circle centered at (50,50) with radius 20", "agent": "ellipseAgent", "startX=90, startY=280, xMin=0, xMax=100, yMin=0, yMax=60, graphScaleX=420, graphScaleY=750"}
  ]}
\`\`\`

# Example 3:
"context": "startX=-525, startY=586, xMin=-100, xMax=0, yMin=-100, yMax=0, graphScaleX=1000, graphScaleY=2000"
# Prompt when arrowAgent and pointAgent will be relevant: "Draw an arrow from (-90,-90) to (-70,-40). Draw another arrow between (-33,-27) and (-8,-10). Draw a point at (-13.37, -9.11)"
# IMPORTANT: The word 'between' MEANS bidirectional, and the word 'from' MEANS unidirectional. Add one of these keywords (bidirectional or unidirectional) to your prompt for the arrow agent.
\`\`\`json
  {"processingSteps": [
    { "prompt": "Draw a unidirectional arrow from (-90,-90) to (-70,-40)", "agent": "arrowAgent", "context": "startX=-525, startY=586, xMin=-100, xMax=0, yMin=-100, yMax=0, graphScaleX=1000, graphScaleY=2000" },
    { "prompt": "Draw a bidirectional arrow between (-33,-27) and (-8,-10) in orange", "agent": "arrowAgent", "context": "startX=-525, startY=586, xMin=-100, xMax=0, yMin=-100, yMax=0, graphScaleX=1000, graphScaleY=2000" },
    { "prompt": "Mark a point at (-13.37,-9.11)", "agent": "pointAgent", "context": "startX=-525, startY=586, xMin=-100, xMax=0, yMin=-100, yMax=0, graphScaleX=1000, graphScaleY=2000" },
  ]}
\`\`\`

# Example 4:
"context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-100, yMax=100, graphScaleX=500, graphScaleY=2500"
# Prompt when functionAgent and arrowAgent will be relevant: "Graph the functions y=x^2*sin(x) in brown and and y=69/(1+e^(-x)) in purple as well as a thick magenta arrow between (4,20) and (6,9)"
\`\`\`json
  {"processingSteps": [
    { "prompt": "Graph the function y=x^2*sin(x) in brown", "agent": "functionAgent", "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-100, yMax=100, graphScaleX=500, graphScaleY=2500" },
    { "prompt": "Graph the function y=69/(1+e^(-x)) in purple", "agent": "functionAgent", "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-100, yMax=100, graphScaleX=500, graphScaleY=2500" },
    { "prompt": "Draw a thick bidirectional magenta arrow between (4,20) and (6,9)", "agent": "arrowAgent", "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-100, yMax=100, graphScaleX=500, graphScaleY=2500" }
  ]}
\`\`\`
</System>
`;

export default templatePreprocessing;
