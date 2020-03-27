import React from 'react';
import { Pane, Paragraph, minorScale } from 'evergreen-ui';

export const MainPanel: React.FC = ({ children }) => {
  return (
    <Pane gridArea="main" border="default" padding={minorScale(2)}>
      <Paragraph size={500}>{children}</Paragraph>
    </Pane>
  );
};
