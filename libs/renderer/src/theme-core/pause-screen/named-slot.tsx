import { useAtom, useSetup } from '@xoid/react';
import { useAttributes } from '../../content/attributes';
import { ReactNode, createContext } from 'react';
import { Attributes, namedSlots$ } from '@qspider/game-state';
import { atom } from 'xoid';
import { slotContentContext } from './slots';

const namedSlotContentContext = createContext<{ path: string }>({ path: '' });

export const QspNamedSlot: React.FC<{ path: string; attrs: Attributes; children: ReactNode }> = (props) => {
  const { attrs, children, path } = props;
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-save-slot');
  const saveData$ = useSetup((props$) => {
    const path$ = props$.focus((p) => p.path);
    return atom((get) => {
      const path = get(path$);
      const savedList = get(namedSlots$);
      return savedList.find((save) => save.key === path);
    });
  }, props);
  const saveData = useAtom(saveData$);
  return (
    <slotContentContext.Provider value={{ index: -1, date: saveData?.timestamp }}>
      <namedSlotContentContext.Provider value={{ path: props.path }}>
        <Tag
          {...attributes}
          style={style}
          data-qsp-save
          data-qsp-save-path={path}
          data-save-empty={saveData ? null : ''}
        >
          {children}
        </Tag>
      </namedSlotContentContext.Provider>
    </slotContentContext.Provider>
  );
};
