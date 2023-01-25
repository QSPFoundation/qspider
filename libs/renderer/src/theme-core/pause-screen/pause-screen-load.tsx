import { Attributes, restoreFromSlot } from '@qspider/game-state';
import * as Tabs from '@radix-ui/react-tabs';
import { ReactNode } from 'react';
import { useAttributes } from '../../content/attributes';
import { slotActionContext } from './slots';

export const QspPauseScreenLoad: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-pause-screen-load');
  const action = async (index: number): Promise<void> => {
    await restoreFromSlot(index);
  };
  return (
    <slotActionContext.Provider value={{ action, disableEmpty: true }}>
      <Tabs.Content value="load">
        <Tag style={style} {...attributes}>
          {children}
        </Tag>
      </Tabs.Content>
    </slotActionContext.Provider>
  );
};
