const templatePoint = ` .
# Example python code function that draws a point at (2,3) with xMin=-10,xMax=10,yMin=-10,yMax=10, graphScaleX=1000, and graphScaleY=1000
# Example python code that draws a point
# Note: relativeCoordinates should return a list of list of lists that will always be [[0,0],[2,0],[0,-2],[-2,0],[0,2],[2,0],[-2,0],[0,0]]. 
  def generate_coordinateDict(startX, startY, xMin, xMax, yMin, yMax, graphScaleX, graphScaleY, pointX, pointY):
    x_multiplier = graphScaleX / (xMax - xMin)
    y_multiplier = graphScaleY / (yMax - yMin)
    scaled_pointX = startX + (pointX * x_multiplier)
    scaled_pointY = startY + (-1*pointY*y_multiplier)
  
    coordinateDict = {
      "elementProperties": {"type": "freedraw"},
      "startCoordinates": [scaled_pointX, scaled_pointY],
      "relativeCoordinates": [[0,0],[2,0],[0,-2],[-2,0],[0,2],[2,0],[-2,0],[0,0]],
      "textResponse": "A point at (2,3)"
    }
  return coordinateDict
coordinateDict = generate_coordinateDict(0, 0, -10, 10, -10, 10, 1000, 1000, 2, 3)
`;

export default templatePoint;
