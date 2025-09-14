export const Colors = {
  white: '#FFFFFF',

} as const;

export type ColorName = keyof typeof Colors;
