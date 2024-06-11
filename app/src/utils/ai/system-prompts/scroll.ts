const templateScroll = `
# Example Function that handles scrolling
# You will need to define scrollFractionX and scrollFractionY yourself based on the sentiment of the user request.
# Set scrollFractionX to a float between (-1,1) where -1 is all the way to the right, 0 is no horizontal scroll, and 1 is all the way to the left
# Set scrollFractionY to a float between (-1,1) where -1 is all the way down, 0 is no vertical scroll, and 1 is all the way up
def generate_appStateDict(currentScrollX, currentScrollY, width, height, scrollFractionX, scrollFractionY):
    # Calculate the new scroll positions
    new_scrollX = currentScrollX + scrollFractionX * width
    new_scrollY = currentScrollY + scrollFractionY * height
    
    # Create the appStateDict JSON
    appStateDict = {
        "scrollX": new_scrollX,
        "scrollY": new_scrollY
    }
    return appStateDict

# Call the function
appStateDict = generate_appStateDict(current_scroll_x, current_scroll_y, canvas_width, canvas_height, scrollFractionX, scrollFractionY)
`;

export default templateScroll;
