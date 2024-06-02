const templateEllipse = `
This JSON also contains a list of relativeCoordinates that contains exactly two points.

def generate_coordinateDict(startX, startY, xMin, xMax, yMin, yMax, graphScaleX, graphScaleY, centerX, centerY, radius):
  x_multiplier = graphScaleX / (xMax - xMin)
  y_multiplier = graphScaleY / (yMax - yMin)

  topLeftX = startX + (centerX - radius) * x_multiplier
  topLeftY = startY + (-1*centerY - radius) * y_multiplier
  width = radius*2 * x_multiplier
  height = radius*2 * y_multiplier

  coordinateDict = {
    "elementProperties": {"type": "ellipse", "sloppiness": 0},
    "startCoordinates": [topLeftX, topLeftY],
    "relativeCoordinates": [[0, 0], [width, height]],
    "textResponse": "Circle with center (centerX, centerY) and radius of (radius)" 
  }
  
  return coordinateDict
`;

export default templateEllipse;
