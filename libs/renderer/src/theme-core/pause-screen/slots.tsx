import { Attributes, saveSlots$, saveSlotsCount$ } from '@qspider/game-state';
import React, { createContext, ReactElement, ReactNode, useContext } from 'react';
import { useAttributes } from '../../content/attributes';
import { useAtom } from '@xoid/react';
import { atom } from 'xoid';
import { formatDate } from '@qspider/i18n';

export const slotContentContext = createContext<{ index: number; date?: number }>({ index: -1 });

const baseSlots$ = atom((get) => Array.from({ length: get(saveSlotsCount$) }, (_, index) => index + 1));

export const QspSlotsList: React.FC<{ attrs: Attributes; children: ReactNode }> = ({ attrs, children }) => {
  const baseSlots = useAtom(baseSlots$);
  const savedSlots = useAtom(saveSlots$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-slots-list');
  return (
    <Tag style={style} {...attributes}>
      {baseSlots.map((index) => {
        const savedEntry = savedSlots.find((s) => s.slot === index);
        return (
          <slotContentContext.Provider value={{ index, date: savedEntry?.timestamp }} key={index}>
            {React.Children.map(children, (child) => {
              return React.cloneElement(child as ReactElement);
            })}
          </slotContentContext.Provider>
        );
      })}
    </Tag>
  );
};

export const QspSlot: React.FC<{ index: number; date?: number; attrs: Attributes; children: ReactNode }> = ({
  attrs,
  children,
}) => {
  const { index, date } = useContext(slotContentContext);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-save-slot');
  const preparedStyle = {
    ...style,
    '--slot-index': `${index}`,
  };
  return (
    <Tag
      {...attributes}
      style={preparedStyle}
      data-qsp-save
      data-qsp-save-index={index}
      data-save-empty={date ? null : ''}
    >
      {children}
    </Tag>
  );
};

export const QspSlotIndex: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { index } = useContext(slotContentContext);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-slot-index');
  return (
    <Tag {...attributes} style={style}>
      {index}
    </Tag>
  );
};

export const QspSlotDate: React.FC<{ children: ReactNode; attrs: Attributes }> = ({ children, attrs }) => {
  const { date } = useContext(slotContentContext);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-slot-date');
  if (!date)
    return (
      <Tag {...attributes} style={style}>
        {children}
      </Tag>
    );
  return (
    <Tag {...attributes} style={style}>
      {formatDate(new Date(date))}
    </Tag>
  );
};
