import { useQspVariable } from '@qspider/game-state';

export const QspVariable: React.FC<{ name: string; key?: string; index?: number }> = ({
  name,
  key = '',
  index = 0,
}) => {
  const defaultValue = name.startsWith('$') ? '' : 0;
  const value = useQspVariable(name, key, index, defaultValue);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{value}</>;
};
