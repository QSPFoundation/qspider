import { useTranslation } from 'react-i18next';

export const QspT: React.FC<{ children: string }> = ({ children }) => {
  const [t] = useTranslation();

  return <>{t(children)}</>;
};
