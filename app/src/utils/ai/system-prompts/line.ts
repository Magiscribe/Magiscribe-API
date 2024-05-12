const templateLine = ` and startCoordinates list of lists of points.
This JSON also contains a list of list of relative coordates structured like this [[x1,y1],[x2,y2]] that contains exactly two points.
# Be sure to be equally thorough as the function in terms of checking bounding conditions
def generate_coordinate_dict(startX, startY, xMin, xMax, yMin, yMax, graphScale, x1, y1, x2, y2):
  x_multiplier = graphScale / (xMax - xMin)
  y_multiplier = graphScale / (yMax - yMin)
  
  scaled_x1 = startX + (x1 * x_multiplier)
  scaled_y1 = startY + (-1 * y1 * y_multiplier)
  scaled_x2 = startX + (x2 * x_multiplier)
  scaled_y2 = startY + (-1 * y2 * y_multiplier)
  
  coordinate_dict = {
      "objectType": "line",
      "startCoordinates": [[startX, startY]],
      "relativeCoordinates": [[[scaled_x1, scaled_y1], [scaled_x2, scaled_y2]]]
  }
  
  return coordinate_dict
  # (x1, y1) and (x2, y2) contain the points to connect with a line
  coordinateDict = generate_coordinate_dict(startX=0, starty=0, xMin=0, xMax=10, yMin=0, yMax=10, graphScale=1000, x1=?, y1=?, x2=?, y2=?)

  To draw a FULL coordinate axis, the program should return a JSON with start coordinates at [[startX, startY], [startX, startY]] and a list of relative coordinates [[[-1000,0],[1000,0]], [[0,-1000],[0,1000]]. The "objectType" for this is "line"
  To draw a Q1 coordinate axis, the program should return a JSON with start coordinates at [[startX, startY], [startX, startY]] and a list of relative coordinates [[[0,0],[1000,0]], [[0,0],[0,-1000]]. The "objectType" for this is "line"
  # Example for drawing a full coordinate axis, be sure to divide graphScale by 2
    def generate_coordinate_dict(startX, startY, graphScale):
        coordinate_dict = {
            "objectType": "line",
            "startCoordinates": [[startX, startY], [startX, startY]],
            "relativeCoordinates": [[[-graphScale / 2, 0], [graphScale / 2, 0]], [[0, -graphScale / 2], [0, graphScale / 2]]],
        }
        
        return coordinate_dict
    coordinateDict = generate_coordinate_dict(0, 0, 1000)
    
    # Example for drawing a Q1 coordinate axis
    def generate_coordinate_dict(startX, startY, graphScale):
        coordinate_dict = {
            "objectType": "line",
            "startCoordinates": [[startX, startY], [startX, startY]],  # Origin for both axes
            "relativeCoordinates": [[[0, 0], [graphScale, 0]],  # X-axis from 0 to 1000 (rightwards)
                                  [[0, 0], [0, -1*graphScale]]],  # Y-axis from 0 to -1000 (upwards)
        }
        return coordinate_dict
    coordinateDict = generate_coordinate_dict(0, 0, 1000)
`;

export default templateLine;
