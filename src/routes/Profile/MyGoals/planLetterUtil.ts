export const planPrefixes = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

export const planLetter = (index: number) => {
  return planPrefixes[index % planPrefixes.length];
};

export const planNumberPrefix = (index: number) => {
  if (planPrefixes.length == 0) {
    return null;
  }
  return Math.floor(index / planPrefixes.length);
};
