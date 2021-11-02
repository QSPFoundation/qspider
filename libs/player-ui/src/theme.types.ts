import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    backgroundColor: string;
    backgroundImage: string;
    textColor: string;
    fontSize: number;
    fontName: string;
    borderColor: string;
    linkColor: string;
  }
}
