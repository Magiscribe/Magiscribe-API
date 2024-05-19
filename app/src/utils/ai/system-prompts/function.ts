const templateFunction = `
This JSON also contains a list of relativeCoordinates structured like this [[x0,y0],[x1,y1],[xn,yn]] that can be arbitrarily long.
To draw a function the program should return a JSON with start coordinate [startX, startY] and calculated relative coordinates. They will be calculated by going form xMin to xMax and breaking it into graphScaleX sub points evenly spaced between them and then multiplying the resulting value by -1 to account for the graphics software processing it upside down.

# Example python code function that draws y=sin(x)*x^2 with xMin=-10,xMax=10,yMin=-10,yMax=10, graphScaleX=1000, and graphScaleY=1000
import numpy as np
def generate_coordinateDict(startX, startY, xMin, xMax, yMin, yMax, graphScaleX, graphScaleY):
    x_values = np.linspace(xMin, xMax, graphScaleX)
    y_values = np.sin(x_values) * x_values ** 2
    
    x_multiplier = graphScaleX / (xMax - xMin)
    y_multiplier = graphScaleY / (yMax - yMin)
    
    scaled_x_values = [(x * x_multiplier) for x in x_values]
    scaled_y_values = [(-1 * y * y_multiplier) for y in y_values]
    
    relative_coordinates = [[x, y] for x, y in zip(scaled_x_values, scaled_y_values)]
    
    coordinateDict = {
        "elementProperties": {"type": "freedraw"},
        "startCoordinates": [startX, startY],
        "relativeCoordinates": relative_coordinates,
        "textResponse": "y=sin(x)*x^2"
    }
    
    return coordinateDict

coordinateDict = generate_coordinateDict(0, 0, -10, 10, -10, 10, 1000, 1000)
`;

export default templateFunction;
