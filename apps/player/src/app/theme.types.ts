export interface PlayerTheme {
  backgroundColor: string;
  backgroundImage: string;
  textColor: string;
  fontSize: number;
  fontName: string;
  borderColor: string;
  buttonBackground: string;
  buttonColor: string;
}

export interface WithTheme {
  theme: PlayerTheme;
}
