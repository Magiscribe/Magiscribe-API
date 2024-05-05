const templateFunction = `and startCoordinates list of lists of points. 
This JSON also contains a list of list of relative coordates structured like this [[x0,y0],[x1,y1],[x2,y2]] that can be arbitrarily long.
To draw a function the program should return a JSON with start coordinate [[startX, startY]] and calculated relative coordinates. They will be calculated by going form xMin to xMax and breaking it into graphScale sub points evenly spaced between them and then multiplying the resulting value by -1 to account for the graphics software processing it upside down.
To draw a point, the program returns a JSON that has startX and startY equal to the point and relativeCoordinates = [[0,0],[0.01,0.01]]

# Example python code function that draws y=sin(x)*x^2 with xMin=-10,xMax=10,yMin=-10,yMax=10, and graphScale=1000:
import numpy as np
def generate_coordinate_dict(startX, startY, xMin, xMax, yMin, yMax, graphScale):
    x_values = np.linspace(xMin, xMax, graphScale)
    y_values = np.sin(x_values)*x_values**2

    filtered_coordinates = [(x, y) for x, y in zip(x_values, y_values) if yMin <= y <= yMax]

    if not filtered_coordinates:
        return None

    x_values_filtered, y_values_filtered = zip(*filtered_coordinates)

    x_multiplier = graphScale / (xMax - xMin)
    y_multiplier = graphScale / (yMax - yMin)

    scaled_x_values = [x * x_multiplier for x in x_values_filtered]
    scaled_y_values = [y * y_multiplier for y in y_values_filtered]

    relative_coordinates = []
    coordinate_sublist = []

    tolerance = 0.01  # Adjust the tolerance value as needed

    for i in range(len(scaled_x_values)):
        if i > 0 and abs(scaled_x_values[i] - (scaled_x_values[i-1] + 1)) > tolerance:
            relative_coordinates.append(coordinate_sublist)
            coordinate_sublist = []

        coordinate_sublist.append([scaled_x_values[i], -scaled_y_values[i]])

    if coordinate_sublist:
        relative_coordinates.append(coordinate_sublist)

    start_coordinates = [[startX, startY]] * len(relative_coordinates)

    coordinate_dict = {
        "objectType": "freedraw",
        "startCoordinates": start_coordinates,
        "relativeCoordinates": relative_coordinates,
    }

    return coordinate_dict

coordinate_dict = generate_coordinate_dict(0, 0, -10, 10, -10, 10, 1000)
`;

export default templateFunction;
