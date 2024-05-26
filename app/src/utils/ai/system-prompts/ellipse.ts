const templateEllipse = `
This JSON also contains a list of relativeCoordinates structured like this [[x1,y1],[x2,y2]] and only contain EXACTLY size two as shown.
Do not have relative coordinates be longer than size 2. Extract the width and height from the prompt. The width and height
shouldn't come from anywhere else. If there isn't a width and height then assume they are 0 (meaning this shape is a circle).

def generate_coordinateDict(startX, startY, width, height):
  
  x2 = startX + width
  y2 = startY + height

  shape = "Ellipse"

  if width == 0:
    shape = "Circle"

  coordinateDict = {
    "elementProperties": {"type": "ellipse"},
    "startCoordinates": [startX, startY],
    "relativeCoordinates": [[startX, startY], [x2, y2]],
    "textResponse": shape 
  }
  
  return coordinateDict
`;

export default templateEllipse;