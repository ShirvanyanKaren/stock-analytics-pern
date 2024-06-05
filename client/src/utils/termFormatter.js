// src/utils/termFormatter.js
export const standardizeTerm = (term) => {
  return term
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // Add space between camelCase words
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')  // Add space between consecutive uppercase words
    .replace(/([a-z])([0-9])/g, '$1 $2')  // Add space between letters and numbers
    .replace(/([0-9])([a-zA-Z])/g, '$1 $2')  // Add space between numbers and letters
    .toLowerCase();
};
