import React from 'react';
import { Global, css } from '@emotion/core';

import { GameManagerProvider } from './game/manager';
import { LayoutProvider } from './game/layout';
import { Game } from './game';
import { Theme } from './game/theme';
import { Player } from './components/player';
import Color from 'color';

const color = Color('#efefef');
console.log(
  color.negate() // rgb(0, 100, 255) -> rgb(255, 155, 0)
);

color.lighten(0.5); // hsl(100, 50%, 50%) -> hsl(100, 50%, 75%)
color.lighten(0.5); // hsl(100, 50%, 0)   -> hsl(100, 50%, 0)
color.darken(0.5); // hsl(100, 50%, 50%) -> hsl(100, 50%, 25%)
color.darken(0.5); // hsl(100, 50%, 0)   -> hsl(100, 50%, 0)

color.lightness(50); // hsl(100, 50%, 10%) -> hsl(100, 50%, 50%)

color.saturate(0.5); // hsl(100, 50%, 50%) -> hsl(100, 75%, 50%)
color.desaturate(0.5); // hsl(100, 50%, 50%) -> hsl(100, 25%, 50%)
color.grayscale(); // #5CBF54 -> #969696

color.whiten(0.5); // hwb(100, 50%, 50%) -> hwb(100, 75%, 50%)
color.blacken(0.5); // hwb(100, 50%, 50%) -> hwb(100, 50%, 75%)

color.rotate(180); // hsl(60, 20%, 20%) -> hsl(240, 20%, 20%)
color.rotate(-90); // hsl(60, 20%, 20%) -> hsl(330, 20%, 20%)

export const App = () => {
  return (
    <GameManagerProvider>
      <LayoutProvider>
        <Theme>
          <Global
            styles={css`
              body {
                margin: 0;
              }
              *,
              *:before,
              *:after {
                box-sizing: border-box;
              }
            `}
          />
          <Game>
            <Player />
          </Game>
        </Theme>
      </LayoutProvider>
    </GameManagerProvider>
  );
};
