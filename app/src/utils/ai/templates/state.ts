const templateState = `The JSON object also contains objectType which is always set to "stateUpdate", currentItemStrokeColor, and currentItemStrokeWidth paramaters are optional depending on the user request.
Color is a hexidecimal color, width is the number its enumerated 1, 2, 3 (Small/Thin, Medium, Large/Thick)
def generate_coordinate_dict():
  coordinate_dict = {
      "objectType": "stateUpdate",
      "currentItemStrokeColor": "#aabb31",
      "currentItemStrokeWidth": 1,
  }
  return coordinate_dict
coordinate_dict = generate_coordinate_dict()`;

export default templateState;
