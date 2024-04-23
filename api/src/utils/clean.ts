/**
 * Cleans a code block by removing the ```language and ``` tags
 * @param code
 * @param language
 * @returns
 */
export function cleanCodeBlock(code: string, language: string): string {
  // Regular expression to match ```language at the beginning and ``` at the end of the string
  const codeBlockRegex = new RegExp(`\`\`\`${language}\n([\\s\\S]*?)\n\`\`\``);

  // Extract the code block between ```language and ```
  const match = code.match(codeBlockRegex);
  if (match && match[1]) {
    code = match[1];
  }

  return code;
}
