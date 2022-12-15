import { Attributes, regions$ } from '@qspider/game-state';
import { useAtom, useSetup } from '@xoid/react';
import { ContentRenderer } from '../content-renderer';
import { useAttributes } from '../content/attributes';

export const QspRegion: React.FC<{ name: string; attributes: Attributes }> = ({ name, attributes }) => {
  const content$ = useSetup(() => {
    return regions$.focus((s) => s[name]);
  });
  const content = useAtom(content$);
  const preparedAttributes = useAttributes(attributes, 'qsp-region');
  return (
    <qsp-region data-name={name} {...preparedAttributes}>
      <ContentRenderer content={content} />
    </qsp-region>
  );
};
