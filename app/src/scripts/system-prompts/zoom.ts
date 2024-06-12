const templateZoom = `
# Example Function that handles zoom
# You will need to define zoomFraction based on the sentiment of the user request.
# Set zoomFraction to a float between (0.25, 4) where 0.25 is zooming all the way out, 1 is no zoom, and 4 is zooming all the way in
def generate_appStateDict(currentZoom, zoomFraction):
    # Calculate the new zoom positions
    new_zoom = currentZoom * zoomFraction
    
    # Create the appStateDict JSON
    appStateDict = {
        "zoom": {"value": new_zoom}
    }
    return appStateDict

# Call the function
appStateDict = generate_appStateDict(currentZoom, zoomFraction)
`;

export default templateZoom;
