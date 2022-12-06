import { Attributes, restoreFromSlot } from '@qspider/game-state';
import * as Tabs from '@radix-ui/react-tabs';
import { ReactNode } from 'react';
import { useAttributes } from '../../content/attributes';
import { slotActionContext } from './slots';

export const QspPauseScreenLoad: React.FC<{ attributes: Attributes; children: ReactNode }> = ({
  attributes,
  children,
}) => {
  const preparedAttributes = useAttributes(attributes);
  const action = async (index: number): Promise<void> => {
    await restoreFromSlot(index);
  };
  return (
    <slotActionContext.Provider value={{ action }}>
      <Tabs.Content value="load">
        <qsp-pause-screen-load {...preparedAttributes}>{children}</qsp-pause-screen-load>
      </Tabs.Content>
    </slotActionContext.Provider>
  );
};
