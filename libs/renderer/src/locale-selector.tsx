import { Select, SelectOption } from './primitives/select';
import { useTranslation } from 'react-i18next';

const locales: SelectOption[] = [
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: 'Русский',
    value: 'ru-RU',
  },
  {
    label: 'Українська',
    value: 'uk-UA',
  },
];

export const LocaleSelector: React.FC = () => {
  const { i18n } = useTranslation();
  return (
    <Select
      options={locales}
      placehoder=""
      label=""
      value={i18n.language}
      onValueChange={(lang): void => {
        i18n.changeLanguage(lang);
      }}
    />
  );
};
