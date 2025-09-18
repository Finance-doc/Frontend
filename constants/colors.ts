export const Colors = {
  white: '#FFFFFF',
  purple: '#A4A5FF',
  mint: '#7DD8FF',
  gray: '#8C8C8C'

} as const;

export type ColorName = keyof typeof Colors;
