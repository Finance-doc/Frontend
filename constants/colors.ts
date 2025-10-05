export const Colors = {
  white: '#FFFFFF',
  purple: '#A4A5FF',
  mint: '#7DD8FF',
  gray: '#8C8C8C',
  black: '#000',
  textgray: '#737373'

} as const;

export type ColorName = keyof typeof Colors;
