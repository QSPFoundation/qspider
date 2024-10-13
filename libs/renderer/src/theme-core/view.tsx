import { Attributes, view$ } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { MouseEvent, ReactNode } from 'react';
import { useAttributes } from '../content/attributes';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export const QspView: React.FC<{ attrs: Attributes; modal?: boolean; children: ReactNode }> = ({
  attrs,
  modal,
  children,
}) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-view');
  const view = useAtom(view$);
  const preparedStyle = {
    ...style,
    '--view-image': `url("${view.path}")`,
  };
  if (modal) {
    const onOverlayClick = (e: MouseEvent): void => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('qsp-dialog-container')) {
        view$.actions.close();
      }
    };
    return (
      <Dialog.Root open={view.isOpen} onOpenChange={(): void => view$.actions.close()}>
        <Dialog.Portal container={document.getElementById('portal-container')}>
          <Dialog.Overlay className="qsp-overlay" />
          <Dialog.Content className="qsp-dialog-container" onClick={onOverlayClick}>
            <VisuallyHidden>
              <Dialog.Title></Dialog.Title>
              <Dialog.Description></Dialog.Description>
            </VisuallyHidden>
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
  const view = useAtom(view$);
  if (!view.path) return null;
  return <img src={view.path} alt="" style={style} {...attributes} />;
};
