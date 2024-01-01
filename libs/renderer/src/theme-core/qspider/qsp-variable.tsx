import { useQspVariable } from '@qspider/game-state';

export const QspVariable: React.FC<{ name: string; vkey?: string; index?: number }> = ({
  name,
  vkey = '',
  index = 0,
}) => {
  const defaultValue = name.startsWith('$') ? '' : 0;
  const value = useQspVariable(name, vkey, index, defaultValue);
  return (
    <qsp-variable data-name={name} data-key={vkey ? vkey : index}>
      {value}
    </qsp-variable>
  );
};
