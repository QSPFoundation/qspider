import { useTranslation } from 'react-i18next';
import { locales } from '@qspider/contracts';
import { useAttributes } from '../../content/attributes';
import { Attributes } from '@qspider/game-state';
import { ChangeEvent } from 'react';

export const QspLocaleSelect: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const { i18n } = useTranslation();
  const [, style, attributes] = useAttributes(attrs, 'qsp-locale-select');
  const onChange = (e: ChangeEvent): void => {
    i18n.changeLanguage((e.target as HTMLSelectElement).value);
  };
  return (
    <select value={i18n.language} {...attributes} style={style} onChange={onChange}>
      {locales.map((opt) => (
        <option value={opt.value} key={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
