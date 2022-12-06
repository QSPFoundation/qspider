import { Attributes } from '@qspider/game-state';
import * as Tabs from '@radix-ui/react-tabs';
import { ReactNode } from 'react';
import { useAttributes } from '../../content/attributes';

export const QspPauseScreenPreferences: React.FC<{ attributes: Attributes; children: ReactNode }> = ({
  attributes,
  children,
}) => {
  const preparedAttributes = useAttributes(attributes);
  return (
    <Tabs.Content value="preferences">
      <qsp-pause-screen-preferences {...preparedAttributes}>{children}</qsp-pause-screen-preferences>
    </Tabs.Content>
  );
};
