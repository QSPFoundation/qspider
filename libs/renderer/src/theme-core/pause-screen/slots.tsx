import { Attributes, saveSlots$, useThemeTemplate } from '@qspider/game-state';
import { createContext, ReactNode, useContext } from 'react';
import { DateTime } from 'luxon';
import { useAttributes } from '../../content/attributes';
import { TemplateRenderer } from '../../template-renderer';
import { useAtom } from '@xoid/react';

const slotContentContext = createContext<{ index: number; date?: number }>({ index: -1 });
export const slotActionContext = createContext<{ disableEmpty: boolean; action: (index: number) => void }>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  action: () => {},
  disableEmpty: false,
});

const baseSlots = Array.from({ length: 9 }, (_, index) => index + 1);

export const QspSlotsList: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
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
  const [Tag, style, attributes] = useAttributes(attrs, 'button');
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

export const QspSlotIndex: React.FC = () => {
  const { index } = useContext(slotContentContext);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{index}</>;
};

export const QspSlotDate: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { date } = useContext(slotContentContext);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (!date) return <>{children}</>;
  return <>{DateTime.fromMillis(date).toLocaleString(DateTime.DATETIME_FULL)}</>;
};
