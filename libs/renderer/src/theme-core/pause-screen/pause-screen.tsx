import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

import { currentGame$, isPauseScreenVisible$, pauseScreenTab$, useThemeTemplate } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { TemplateRenderer } from '../../template-renderer';
import { useAttributes } from '../../content/attributes';

export const QspPauseScreen: React.FC = () => {
  const isVisible = useAtom(isPauseScreenVisible$);
  const currentGame = useAtom(currentGame$);
  const { template, attrs } = useThemeTemplate('qsp_pause_screen');
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-pause-screen');
  const currentTab = useAtom(pauseScreenTab$);
  return (
    <Dialog.Root modal open={isVisible} onOpenChange={(isOpen): void => isPauseScreenVisible$.set(isOpen)}>
      <Dialog.Portal container={document.getElementById('portal-container')}>
        <Dialog.Overlay className="qsp-overlay" />
        <Dialog.Content className="qsp-dialog-container">
          <div className="qsp-pause-dialog">
            <Dialog.Title>{currentGame?.title || 'Pause'}</Dialog.Title>
            <VisuallyHidden.Root asChild>
              <Dialog.Description>Game pause screen</Dialog.Description>
            </VisuallyHidden.Root>
            <Tabs.Root asChild value={currentTab} onValueChange={(value): void => pauseScreenTab$.set(value)}>
              <Tag style={style} {...attributes}>
                <TemplateRenderer template={template} />
              </Tag>
            </Tabs.Root>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
