import { Attributes, saveSlots$, saveSlotsCount$, useThemeTemplate } from '@qspider/game-state';
import { createContext, ReactNode, useContext } from 'react';
import { useAttributes } from '../../content/attributes';
import { TemplateRenderer } from '../../template-renderer';
import { useAtom } from '@xoid/react';
import { create } from 'xoid';
import { formatDate } from '@qspider/i18n';

const slotContentContext = createContext<{ index: number; date?: number }>({ index: -1 });
export const slotActionContext = createContext<{ disableEmpty: boolean; action: (index: number) => void }>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  action: () => {},
  disableEmpty: false,
});

const baseSlots$ = create((get) => Array.from({ length: get(saveSlotsCount$) }, (_, index) => index + 1));

export const QspSlotsList: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const baseSlots = useAtom(baseSlots$);
  const savedSlots = useAtom(saveSlots$);
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-slots-list');
  return (
    <Tag style={style} {...attributes}>
      {baseSlots.map((index) => {
        const savedEntry = savedSlots.find((s) => s.slot === index);
        return <QspSlot key={index} index={index} date={savedEntry?.timestamp} />;
      })}
    </Tag>
  );
};

export const QspSlot: React.FC<{ index: number; date?: number }> = ({ index, date }) => {
  const { attrs, template } = useThemeTemplate('qsp_save_slot');
  const [Tag, style, attributes] = useAttributes(attrs, 'button', 'qsp-save-slot');
  const preparedStyle = {
    ...style,
    '--slot-index': `${index}`,
  };
  const { action, disableEmpty } = useContext(slotActionContext);
  return (
    <slotContentContext.Provider value={{ index, date }}>
      <Tag
        {...attributes}
        style={preparedStyle}
        onClick={(): void => action(index)}
        role="button"
        disabled={disableEmpty && !date}
      >
        <TemplateRenderer template={template} {...attrs} />
      </Tag>
    </slotContentContext.Provider>
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
