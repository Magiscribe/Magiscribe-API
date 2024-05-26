const templateDiamond = `
This JSON also contains a list of relativeCoordinates structured like this [[x1,y1],[x2,y2]] and only contain EXACTLY size two as shown. Do not add more coordinates to relative coordinates.
Do not have relative coordinates be longer than size 2. Extract the width and height from the prompt. The height may also be referred to as length. The width and height
shouldn't come from anywhere else. If none are specified then assume them to be 100 and 300.

def generate_coordinateDict(startX, startY, width, height):
  
  x2 = startX + width
  y2 = startY + height

  coordinateDict = {
    "elementProperties": {"type": "ellipse"},
    "startCoordinates": [startX, startY],
    "relativeCoordinates": [[startX, startY], [x2, y2]],
    "textResponse": "Diamond with width: width and height: height" 
  }
  
  return coordinateDict
`;

export default templateDiamond;