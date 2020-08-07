import React from 'react';
import { ThemeProvider } from 'emotion-theming';
import { useLayout } from './layout';
import { observer } from 'mobx-react-lite';

export const Theme: React.FC = observer(({ children }) => {
  const layout = useLayout();
  return <ThemeProvider theme={layout.theme}>{children}</ThemeProvider>;
});
