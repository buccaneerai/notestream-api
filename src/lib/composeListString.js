const composeListString = descriptorStrings => (
  descriptorStrings.reduce((acc, descriptor, i) => {
    if (i === 0) return descriptor;
    if (i === descriptorStrings.length - 1) {
      return `${acc}, ${descriptor}`
    }
    return `${acc}, ${descriptor}`;
  }, '')
);

module.exports = composeListString;
