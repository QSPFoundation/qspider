import { useTranslation } from 'react-i18next';
import { Select } from './primitives';
import { locales } from '@qspider/contracts';

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
