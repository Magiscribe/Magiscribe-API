const templateScroll = `
The appStateDict should have the following structure:
{
  "scrollX": <new_scroll_x_value>,
  "scrollY": <new_scroll_y_value>
}

You will need to define scrollFractionX and scrollFractionY yourself based on the sentiment of the user request.
For scrollFractionX:
  - "Scroll all the way over to the right" is -0.8
  - "Scroll to the right" is -0.5
  - "A little bit to the right" is -0.2
  - 0 represents no reference to horizontal scrolling
  - Flip the values for the left direction similarly:
    - "Scroll all the way over to the left" is 0.8
    - "Scroll to the left" is 0.5
    - "A little bit to the left" is 0.2

For scrollFractionY:
  - "Scroll all the way down" is -1
  - "Scroll down" is -0.5
  - "A little bit down" is -0.2
  - 0 represents no reference to vertical scrolling
  - Flip the values for the up direction similarly:
    - "Scroll all the way up" is 1
    - "Scroll up" is 0.5
    - "A little bit up" is 0.2

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
