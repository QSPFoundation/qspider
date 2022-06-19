import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { observer } from 'mobx-react-lite';
import { useBaseLayout } from '@qspider/providers';

export const Theme: React.FC<{ children: React.ReactNode }> = observer(({ children }) => {
  const layout = useBaseLayout();
  return <ThemeProvider theme={layout.theme}>{children}</ThemeProvider>;
});
