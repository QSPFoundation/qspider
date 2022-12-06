import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';

import { currentGame$, isPauseScreenVisible$, pauseScreenTab$, useThemeTemplate } from '@qspider/game-state';
import { useAtom } from '@xoid/react';
import { TemplateRenderer } from '../../template-renderer';
import { useAttributes } from '../../content/attributes';

export const QspPauseScreen: React.FC = () => {
  const isVisible = useAtom(isPauseScreenVisible$);
  const currentGame = useAtom(currentGame$);
  const { template, attrs } = useThemeTemplate('qsp_pause_screen');
  const preparedAttrs = useAttributes(attrs);
  const currentTab = useAtom(pauseScreenTab$);
  return (
    <Dialog.Root modal open={isVisible} onOpenChange={(isOpen): void => isPauseScreenVisible$.set(isOpen)}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>{currentGame?.title || 'Pause'}</Dialog.Title>
          {/* <VisuallyHidden asChild> */}
          <Dialog.Description>Game pause screen</Dialog.Description>
          {/* </VisuallyHidden> */}
          <Tabs.Root asChild value={currentTab} onValueChange={(value): void => pauseScreenTab$.set(value)}>
            <qsp-pause-screen {...preparedAttrs}>
              <TemplateRenderer template={template} />
            </qsp-pause-screen>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
