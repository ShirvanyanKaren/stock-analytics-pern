// src/utils/termFormatter.js
export const standardizeTerm = (term) => {
  return term.trim().toLowerCase().replace(/[\s\W]+/g, '');
};
