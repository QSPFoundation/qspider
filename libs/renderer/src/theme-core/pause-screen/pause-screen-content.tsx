import { Attributes } from '@qspider/game-state';
import { ReactNode } from 'react';
import { useAttributes } from '../../content/attributes';

export const QspPauseScreenContent: React.FC<{ attributes: Attributes; children: ReactNode }> = ({
  attributes,
  children,
}) => {
  const preparedAttributes = useAttributes(attributes, 'qsp-pause-screen-content');
  return <qsp-pause-screen-content {...preparedAttributes}>{children}</qsp-pause-screen-content>;
};
