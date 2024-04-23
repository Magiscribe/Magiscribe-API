const templatePoint = ` and startCoordinates list of lists of points.
This JSON also contains a list of list of relative coordates structured like this [[x0,y0],[x1,y1],[xn,yn]]
# Example python code function that draws a point at (2,3) with xMin=-10,xMax=10,yMin=-10,yMax=10,and graphScale=1000
# Example python code that draws a point
# Note: relativeCoordinates should return a list of list of lists that will always be [[[0,0],[2,0],[0,-2],[-2,0],[0,2],[2,0],[-2,0],[0,0]]]. The nesting looks excessive, it is necessary
  def generate_coordinate_dict(startX, startY, xMin, xMax, yMin, yMax, graphScale, pointX, pointY):
    x_multiplier = graphScale / (xMax - xMin)
    y_multiplier = graphScale / (yMax - yMin)
    scaled_pointX = startX + (pointX * x_multiplier)
    scaled_pointY = startY + (-1*pointY*y_multiplier)
  
    coordinate_dict = {
      "objectType": "freedraw",
      "startCoordinates": [[scaled_pointX, scaled_pointY]],
      "relativeCoordinates": [[[0,0],[2,0],[0,-2],[-2,0],[0,2],[2,0],[-2,0],[0,0]]],
    }
  return coordinate_dict
coordinate_dict = generate_coordinate_dict(0, 0, -10, 10, -10, 10, 1000, 2, 3)
`;

export default templatePoint;
