import { Attributes, saveSlots$, useThemeTemplate } from '@qspider/game-state';
import { createContext, useContext } from 'react';
import { DateTime } from 'luxon';
import { useAttributes } from '../../content/attributes';
import { TemplateRenderer } from '../../template-renderer';
import { useAtom } from '@xoid/react';

const slotContentContext = createContext<{ index: number; date?: number }>({ index: -1 });
export const slotActionContext = createContext<{ action: (index: number) => void }>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  action: () => {},
});

const baseSlots = Array.from({ length: 9 }, (_, index) => index + 1);

export const QspSlotsList: React.FC = () => {
  const savedSlots = useAtom(saveSlots$);
  console.log(savedSlots);
  return (
    <>
      {baseSlots.map((index) => {
        const savedEntry = savedSlots.find((s) => s.slot === index);
        return <QspSlot key={index} index={index} date={savedEntry?.timestamp} />;
      })}
    </>
  );
};

export const QspSlot: React.FC<{ index: number; date?: number }> = ({ index, date }) => {
  const { attrs, template } = useThemeTemplate('qsp_save_slot');
  const { tag, ...otherAttrs } = attrs;
  const Tag = (tag || 'div') as 'div';
  const { style = {}, ...preparedAttrs } = useAttributes(otherAttrs as Attributes, Tag);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (style as any)['--slot-index'] = `${index}`;
  const { action } = useContext(slotActionContext);
  return (
    <slotContentContext.Provider value={{ index, date }}>
      <Tag {...preparedAttrs} style={style as React.CSSProperties} onClick={(): void => action(index)}>
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

export const QspSlotDate: React.FC = () => {
  const { date } = useContext(slotContentContext);
  if (!date) return null;
  return <>{DateTime.fromMillis(date).toLocaleString(DateTime.DATETIME_FULL)}</>;
};
