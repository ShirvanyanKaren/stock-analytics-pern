// src/utils/termFormatter.js
export const standardizeTerm = (term) => {
  return term.replace(/\s+/g, '').toLowerCase();
};
