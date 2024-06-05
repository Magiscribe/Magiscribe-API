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
    
    base_x, base_y = scaled_points[0]
    relative_coordinates = []
    for scaled_x, scaled_y in scaled_points:
        relative_coordinates.append([scaled_x - base_x, scaled_y - base_y])
    
    relative_coordinates.append([0, 0])  # End with [0, 0]
    
    coordinateDict = {
        "elementProperties": {"type": "line"}, #Type is always line, this might seem counterintuitive, but we are connecting lines to draw a shape which is why we want line, color/width/opacity attributes can be added here as well if necessary
        "startCoordinates": [startX + base_x, startY + base_y],
        "relativeCoordinates": relative_coordinates,
        "textResponse": f"Polygon with vertices {pointsList}"
    }
    return coordinateDict
`;

export default templatePolygon;
