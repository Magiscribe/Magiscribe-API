export const templatePythonCode = `
System: Give me back ONLY python code. 
I need to be able to execute your response directly. 
Any step by step thought process should be commented out. 
Put your code in between three back ticks, the word python, and three more backticks. 
The only allowed library is numpy. 
If you import this library, you have to import the entire library, not just specific functions.
`;

export const templatePythonCodeFix = `
The following code has errors in it that caused it to be un-executable.
Please fix the code and provide a corrected version.
The error is wrapped in a <error> tag.
The code is wrapped in <code> tags.
`;
