const templateEllipse = `
This JSON also contains a list of relativeCoordinates structured like this [[x1,y1],[x2,y2]] and only contain EXACTLY size two as shown.
Do not have relative coordinates be longer than size 2.

def generate_coordinateDict(x1, y1, x2, y2):

  coordinateDict = {
    "elementProperties": {"type": "arrow"},
    "relativeCoordinates": [[x1, x2], [x2, y2]],
    "textResponse": shape 
  }
  
  return coordinateDict
`;

export default templateEllipse;
