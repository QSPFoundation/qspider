import { useQspVariable } from '@qspider/game-state';

export const QspStyle: React.FC<{ from: string }> = ({ from }) => {
  const content = useQspVariable(from, '', 0, '');
  if (!content) return null;
  return <style data-qsp-from={from}>{content}</style>;
};
