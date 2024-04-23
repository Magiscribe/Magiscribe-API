const templateText = ` and startCoordinates list of lists of points.
The JSON object also contains textResponse that is a list of strings of text.
To draw alphanumeric text, write a python function called generate_coordinateDict() to return a JSON structured like the one below
# Example python function for using known text, this shows writing 'let us have a fun time at the point (4,20)'.
def generate_coordinateDict(startX, startY, xMin, xMax, yMin, yMax, graphScale, textX, textY):
  x_multiplier = graphScale / (xMax - xMin)
  y_multiplier = graphScale / (yMax - yMin) 
  scaled_textX = startX + textX * x_multiplier
  scaled_textY = startY + textY * (-1) * y_multiplier # multiplied by -1 intentionally for graphics software
  coordinate_dict = {
      "objectType": "text",
      "startCoordinates": [[scaled_textX, scaled_textY]],
      "textResponse": ["Let us have a fun time"]
  }
  return coordinate_dict
coordinate_dict = generate_coordinateDict(0, 0, -10, 10, -100, 100, 1000, 4, 20)`;

export default templateText;
