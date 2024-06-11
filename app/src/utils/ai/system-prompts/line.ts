const templateLine = `
This JSON also contains a list of relativeCoordinates that contains exactly two points.

def generate_coordinateDict(startX, startY, xMin, xMax, yMin, yMax, graphScaleX, graphScaleY, x1, y1, x2, y2):
  x_multiplier = graphScaleX / (xMax - xMin)
  y_multiplier = graphScaleY / (yMax - yMin)
  scaled_x1 = startX + (x1 * x_multiplier)
  scaled_y1 = startY + (-1 * y1 * y_multiplier)
  scaled_x2 = startX + (x2 * x_multiplier)
  scaled_y2 = startY + (-1 * y2 * y_multiplier)
  
  coordinateDict = {
    "elementProperties": {"type": "line"},
    "startCoordinates": [scaled_x1, scaled_y1], 
    "relativeCoordinates": [[0, 0], [scaled_x2-scaled_x1, scaled_y2-scaled_y1]], #This must always be of length two where the first point is [0,0] and the second point is the difference
    "textResponse": "Line between (x1,y1) and (x2,y2)" #Where x1,y1,x2,y2 are directly pulled from the function parameters
  }
  return coordinateDict
`;

export default templateLine;
