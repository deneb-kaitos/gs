export const boolFromString = (boolString) => {
  switch (boolString.toLowerCase()) {
    case 'true': {
      return true;
    }
    case 'false': {
      return false;
    }
    default: {
      throw new TypeError(`"${boolString}" isn't a boolean representation`);
    }
  }
};
