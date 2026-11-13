import { formatQspValue, isTuple, useQspVariableRaw } from '@qspider/game-state';

export const QspVariable: React.FC<{ name: string; vkey?: string; index?: number }> = ({
  name,
  vkey = '',
  index = 0,
}) => {
  const raw = useQspVariableRaw(name, vkey, index);
  const unset = !isTuple(raw) && (raw === undefined || raw === '' || raw === 0);
  const text = unset ? (name.startsWith('$') ? '' : '0') : formatQspValue(raw);
  return (
    <qsp-variable data-qsp="variable" data-name={name} data-key={vkey ? vkey : index}>
      {text}
    </qsp-variable>
  );
};
