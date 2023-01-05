import { useTranslation } from 'react-i18next';

export const QspT: React.FC<{ tkey: string }> = ({ tkey }) => {
  const [t] = useTranslation();

  return <>{t(tkey)}</>;
};
