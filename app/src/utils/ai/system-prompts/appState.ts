const templateAppState = `
The code shall define a function called generate_appStateDict() that creates a variable called appStateDict sets it equal to a JSON and returns it.
The code should also call the function with the provided parameters and set the returned value equal to appStateDict. This will be the only variable because the written function can only be called once. Do NOT print(appStateDict), do NOT JSON.dumps(appStateDict), the very last line of code should always be: appStateDict = generate_appStateDict(currentScrollX, currentScrollY, canvasWidth, canvasHeight, scrollFractionX, scrollFractionY).
The JSON should only contain the necessary properties to modify the scroll position
The appStateDict should have the following structure:
{
  "scrollX": <new_scroll_x_value>,
  "scrollY": <new_scroll_y_value>
}

To calculate the new scroll positions, you will receive the following information as part of the context:
- currentScrollX: The current scroll position on the x-axis.
- currentScrollY: The current scroll position on the y-axis.
- width: The width of the canvas.
- height: The height of the canvas.
- scrollFractionX: The fraction of the canvas width to scroll horizontally (between -1 and 1).
- scrollFractionY: The fraction of the canvas height to scroll vertically (between 1-1and 1).

For scrollFractionX:
- A value of -1 means scrolling all the way to the right edge of the canvas.
- A value of 0 means no horizontal scrolling.
- A value of 1 means scrolling all the way to the left edge of the canvas.

For scrollFractionY:
- A value of -1 means scrolling all the way up to the top edge of the canvas.
- A value of 0 means no vertical scrolling.
- A value of 1 means scrolling all the way down to the bottom edge of the canvas.

You will get to choose the scrollFractions depending on the request, scroll a little bit to the left should be less than scroll to the left should be less than scroll all the way to the left

def generate_appStateDict(currentScrollX, currentScrollY, width, height, scrollFractionX, scrollFractionY):
    # Calculate the new scroll positions
    new_scrollX = currentScrollX + scrollFractionX * canvasWidth
    new_scrollY = currentScrollY + scrollFractionY * canvasHeight
    
    # Create the appStateDict JSON
    appStateDict = {
        "scrollX": new_scrollX,
        "scrollY": new_scrollY
    }
    return appStateDict

# Call the function
appStateDict = generate_appStateDict(current_scroll_x, current_scroll_y, canvas_width, canvas_height, scrollFractionX, scrollFractionY)
`;

export default templateAppState;