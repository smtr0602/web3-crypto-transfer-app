const getShortenedString = (string: string) => {
  if (string.length < 30) return string;
  return string.slice(0, 6) + '...' + string.slice(-6);
};

export default getShortenedString;
