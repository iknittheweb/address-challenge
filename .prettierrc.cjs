// ------------------------------------------------------------
// BEGINNER-FRIENDLY EXPLANATORY COMMENTS
// ------------------------------------------------------------
// This file configures Prettier, a tool for automatically formatting code.
// Prettier helps keep your code style consistent and readable across your project.
//
// Key concepts:
// - Prettier: Code formatter for HTML, CSS, JS, and more
// - Option: A setting that controls how Prettier formats your code
// - Configuration: Customizes Prettier's behavior for your project
// ------------------------------------------------------------
// Prettier configuration with explanatory comments
module.exports = {
  printWidth: 120, // Shorter line length for more readable HTML
  tabWidth: 2, // Number of spaces per indentation level
  semi: true, // Add semicolons at the ends of statements
  singleQuote: true, // Use single quotes instead of double quotes
  trailingComma: 'es5', // Add trailing commas where valid in ES5 (objects, arrays, etc.)
  endOfLine: 'lf', // Use line feed (\n) for line endings
  bracketSpacing: true, // Print spaces between brackets in object literals
  htmlWhitespaceSensitivity: 'ignore', // Ignore whitespace sensitivity for more readable HTML
  singleAttributePerLine: false, // Put each HTML attribute on its own line
  bracketSameLine: false, // Put > of a multi-line HTML element on a new line
  arrowParens: 'always', // Always include parentheses around arrow function parameters
  proseWrap: 'never', // Wrap markdown text as needed
};
