const templateAppState = `
The code shall define a function called generate_appStateDict() that creates a variable called appStateDict sets it equal to a JSON and returns it.
The code should also call the function with the provided parameters and set the returned value equal to appStateDict. 
This will be the only variable because the written function can only be called once. 
Do NOT print(appStateDict), do NOT JSON.dumps(appStateDict), the very last line of code should always be: 
  appStateDict = generate_appStateDict() #Possibly with parameters
The appStateDict JSON that gets returned should only contain the necessary properties to satisfy the user request
`;

export default templateAppState;
