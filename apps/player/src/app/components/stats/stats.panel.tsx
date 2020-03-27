import React from 'react';
import { Pane, minorScale, Paragraph } from 'evergreen-ui';

export const StatsPanel: React.FC = ({ children }) => {
  return (
    <Pane gridArea="stats" border="default" padding={minorScale(2)}>
      <Paragraph size={500}>{children}</Paragraph>
    </Pane>
  );
};
