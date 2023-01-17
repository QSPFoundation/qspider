import { Attributes, getResource, viewPath$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { ReactNode } from 'react';
import { useAttributes } from '../content/attributes';
import * as Dialog from '@radix-ui/react-dialog';

export const QspView: React.FC<{ attrs: Attributes; modal?: boolean; children: ReactNode }> = ({
  attrs,
  modal,
  children,
}) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-view');
  const path = useAtom(viewPath$);
  if (!path) return null;
  const preparedStyle = {
    ...style,
    '--view-image': `url(${getResource(path).url})`,
  };
  if (modal) {
    return (
      <Dialog.Root open={true} onOpenChange={(): void => viewPath$.set('')}>
        <Dialog.Portal container={document.getElementById('portal-container')}>
          <Dialog.Overlay className="qsp-overlay" />
          <Dialog.Content>
            <Tag {...attributes} style={preparedStyle}>
              {children}
            </Tag>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
  return (
    <Tag {...attributes} style={preparedStyle}>
      {children}
    </Tag>
  );
};

export const QspViewImage: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [, style, attributes] = useAttributes(attrs, 'img');
  const path = useAtom(viewPath$);
  if (!path) return null;
  return <img src={getResource(path).url} alt="" style={style} {...attributes} />;
};
