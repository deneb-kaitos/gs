export const boolFromString = (boolString = null) => {
  if (boolString === null) {
    throw new ReferenceError('input is undefined');
  }

  switch (boolString.toLowerCase().trim()) {
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
