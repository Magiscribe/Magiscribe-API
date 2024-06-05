const templatePreprocessing = `
<System>
Give me back a JSON object surrounded by three backticks and the word json.
The top of the JSON object should contain a key called processingSteps that is an array of objects.
Structure: The processingSteps JSON is an array of objects that contain a message, an agent, and context. The message, agent, and context are all strings.
message contains simple commands for a particular agent. These commands will later be executed in order.
selected agents can ONLY be one of the following: lineAgent, functionAgent, textAgent, ellipseAgent, arrowAgent, polygonAgent or pointAgent. Do NOT include any other agents.
lineAgent draws lines, functionAgent draws functions, textAgent writes alphanumeric text with known characters, ellipseAgent draws ellipses and circles, polygonAgent draws triangles, quadrilaterals, pentagons, hexagons, octagons, etc., arrowAgent draws both unidirectional and bidrectional arrows, pointAgent draws points.
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
# Prompt when polygonAgent and ellipseAgent will be relevant: "Draw a rectangle from (10,10), (10, 40), (40,10), (40,40) and a thick ellipse centered at (50,50) with a radius of 20 units."
# Note: The graph scales do not
\`\`\`json
  {"processingSteps": [
    { "prompt": "Draw a rectangle from (10,10), (10, 40), (40,10), (40,40)", "agent": "polygonAgent", "context": "startX=90, startY=280, xMin=0, xMax=60, yMin=0, yMax=100, graphScaleX=420, graphScaleY=750"},
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


# Prompt when abstract reasoning will be needed to more precisely specify a vague user request using polygonAgent
# Example 5: "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-10, yMax=10, graphScaleX=500, graphScaleY=500"
# Prompt: "Draw a hexagon in the first quadrant with side length 3. 
Then, draw a square in the third quadrant, followed by an equilateral triangle above it, sharing the top side. 
Finally, add a pentagram inscribed in a circle of radius 4 at (2, -6)."
Note: "Explanation" won't be passed along to the next agent. Use this as an internal thought process to reason step by step about how to create the points coherently
{"processingSteps": [
  {
    "explanation": "For the hexagon, I need to choose a starting point in the first quadrant (0 < x < xMax, 0 < y < yMax). (5, 5) is a good choice given the available context, leaving room for the shape. For my first side I'll go three units across the bottom to (8,5), then I'll go up and to the right to (10, 7), then I'll go up and to the left to (8,9) then I'll go across to (5,9) then down and to the left to (3,7) and finally down and to the right back to (5,5). I don't need to specify the return to the final homepoint, polygonAgent takes care of that for me
    "prompt": "Draw a regular hexagon using points [(5, 5), (8, 5), (10, 7), (8, 9), (5, 9), (3, 7)]",
    "agent": "polygonAgent",
    "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-10, yMax=10, graphScaleX=500, graphScaleY=500"
  },
  {
    "explanation": "Next, a square in the third quadrant (x < 0, y < 0). Center at (-5, -5) works well. Side length is 4, so vertices are 2 units from the center in each direction: (-7, -7), (-3, -7), (-3, -3), (-7, -3) in clockwise order.",
    "prompt": "Draw a square using points [(-7, -7), (-3, -7), (-3, -3), (-7, -3)]",
    "agent": "polygonAgent",
    "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-10, yMax=10, graphScaleX=500, graphScaleY=500"
  },
  {
    "explanation": "An equilateral triangle above the square, sharing its top side. The shared side is (-7, -3) to (-3, -3), length 4. For 60° angles, the height is 4 * sin(60°) ≈ 3.464. So, the top vertex is at (-5, -3 + 3.464) = (-5, 0.464)",
    "prompt": "Draw an equilateral triangle above the square, sharing its top side, using points [(-7, -3), (-3, -3), (-5, 0.464)]",
    "agent": "polygonAgent",
    "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-10, yMax=10, graphScaleX=500, graphScaleY=500"
  },
  {
    "explanation": "Now, a circle at (2, -6) with radius 4. This is a perfect job for the ellipseAgent, as it specializes in drawing circles and ellipses.",
    "prompt": "Draw a circle centered at (2, -6) with radius 4",
    "agent": "ellipseAgent",
    "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-10, yMax=10, graphScaleX=500, graphScaleY=500"
  },
  {
    "explanation": "Finally, a pentagram inscribed in the circle. A pentagram connects every other point of a regular pentagon. So, I'll place 5 points on the circle, each 72° (360°/5) apart. Using polar coordinates (r, θ): (4, 0°), (4, 72°), (4, 144°), (4, 216°), (4, 288°). Converting to Cartesian (x, y): (2+4*cos(θ), -6+4*sin(θ)). Connecting in star pattern: 0 → 2 → 4 → 1 → 3 → 0.",
    "prompt": "Draw a pentagram using points [(2, -2), (5.472, -7.236), (-0.472, -4.764), (4.472, -4.764), (-1.472, -7.236), (2, -2)]",
    "agent": "polygonAgent",
    "context": "startX=0, startY=0, xMin=-10, xMax=10, yMin=-10, yMax=10, graphScaleX=500, graphScaleY=500"
  }
]}

</System>
`;

export default templatePreprocessing;
