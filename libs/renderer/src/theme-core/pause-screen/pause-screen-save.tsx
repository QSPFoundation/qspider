import { Attributes, saveToSlot } from '@qspider/game-state';
import * as Tabs from '@radix-ui/react-tabs';
import { ReactNode } from 'react';
import { useAttributes } from '../../content/attributes';
import { slotActionContext } from './slots';

export const QspPauseScreenSave: React.FC<{ attributes: Attributes; children: ReactNode }> = ({
  attributes,
  children,
}) => {
  const preparedAttributes = useAttributes(attributes, 'qsp-pause-screen-save');
  const action = async (index: number): Promise<void> => {
    await saveToSlot(index);
  };
  return (
    <slotActionContext.Provider value={{ action }}>
      <Tabs.Content value="save">
        <qsp-pause-screen-save {...preparedAttributes}>{children}</qsp-pause-screen-save>
      </Tabs.Content>
    </slotActionContext.Provider>
  );
};
