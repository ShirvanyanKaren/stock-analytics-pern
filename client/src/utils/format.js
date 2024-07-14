export const standardizeTerm = (term) => {
  return term
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // Add space between camelCase words
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')  // Add space between consecutive uppercase words
    .replace(/([a-z])([0-9])/g, '$1 $2')  // Add space between letters and numbers
    .replace(/([0-9])([a-zA-Z])/g, '$1 $2')  // Add space between numbers and letters
    .replace(/_/g, ' ')  // Replace underscores with spaces
    .toLowerCase();
};

export const formatDate = (date) => {
  return new Date(date).toISOString().slice(0, 10);
};

export const titleCase = (str) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z][^\s]*)/g, " $1");
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) {
    return "----";
  }
  if (Math.abs(num) > 1000000000) {
    return (num / 1000000000).toFixed(2) + " B";
  } else if (Math.abs(num) > 1000000) {
    return (num / 1000000).toFixed(2) + " M";
  } else if (Math.abs(num) > 1000) {
    return (num / 1000).toFixed(2) + " K";
  } else {
    return typeof num === "number" ? num.toFixed(2) : num;
  }
};

export const convertToScientific = (num) => {
  if (Math.abs(num) < 0.0001) {
    num = num.toExponential(2);
    return num;
  } else {
    return num.toFixed(3);
  }
};