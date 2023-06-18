import { Attributes, isViewVisible$, viewPath$ } from '@qspider/game-state';
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
  const isVisible = useAtom(isViewVisible$);

  if (!isVisible) return null;
  const preparedStyle = {
    ...style,
    '--view-image': `url("${path}")`,
  };
  if (modal) {
    return (
      <Dialog.Root open={true} onOpenChange={(): void => isViewVisible$.set(false)}>
        <Dialog.Portal container={document.getElementById('portal-container')}>
          <Dialog.Overlay className="qsp-overlay" />
          <Dialog.Content className="qsp-dialog-container">
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
  const [, style, attributes] = useAttributes(attrs, 'img', 'qsp-view-image');
  const path = useAtom(viewPath$);
  if (!path) return null;
  return <img src={path} alt="" style={style} {...attributes} />;
};
