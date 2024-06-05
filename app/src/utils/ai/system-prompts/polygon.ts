const templatePolygon = `
This JSON also contains a list of relativeCoordinates that contains exactly an arbitrary number of points.

def generate_coordinateDict(startX, startY, xMin, xMax, yMin, yMax, graphScaleX, graphScaleY, pointsList):
    x_multiplier = graphScaleX / (xMax - xMin)
    y_multiplier = graphScaleY / (yMax - yMin)
    
    scaled_points = []
    for x, y in pointsList:
        scaled_x = startX + (x * x_multiplier)
        scaled_y = startY + (-1 * y * y_multiplier)
        scaled_points.append([scaled_x, scaled_y])
    
    relative_coordinates = [[0, 0]]  # Start with [0, 0]
    for i in range(1, len(scaled_points)):
        prev_x, prev_y = scaled_points[i - 1]
        curr_x, curr_y = scaled_points[i]
        relative_coordinates.append([curr_x - prev_x, curr_y - prev_y])
    
    relative_coordinates.append([0, 0])  # End with [0, 0]
    
    coordinateDict = {
        "elementProperties": {"type": "line"},
        "startCoordinates": [startX + scaled_points[0][0], startY + scaled_points[0][1]],
        "relativeCoordinates": relative_coordinates,
        "textResponse": f"Polygon with vertices {pointsList}"
    }
    return coordinateDict
`;

export default templatePolygon;