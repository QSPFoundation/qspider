import { Attributes } from '@qspider/game-state';
import * as Tabs from '@radix-ui/react-tabs';
import { ReactNode } from 'react';
import { useAttributes } from '../../content/attributes';

export const QspPauseScreenCredits: React.FC<{ attributes: Attributes; children: ReactNode }> = ({
  attributes,
  children,
}) => {
  const preparedAttributes = useAttributes(attributes);
  return (
    <Tabs.Content value="credits">
      <qsp-pause-screen-credits {...preparedAttributes}>{children}</qsp-pause-screen-credits>
    </Tabs.Content>
  );
};
