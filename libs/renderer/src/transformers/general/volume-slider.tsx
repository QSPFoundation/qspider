import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { useAtom } from '@xoid/react';
import { Attributes, volume$ } from '@qspider/game-state';
import { useTranslation } from 'react-i18next';
import { useAttributes } from '../../content/attributes';

export const QspVolumeSlider: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const volume = useAtom(volume$);
  const [t] = useTranslation();
  const [, style, attributes] = useAttributes(attrs, 'span');

  return (
    <Slider.Root
      className="qsp-volume-root"
      defaultValue={[volume]}
      max={100}
      step={1}
      style={style}
      {...attributes}
      onValueChange={([volume]): void => volume$.set(volume)}
    >
      <Slider.Track className="qsp-volume-slider-track">
        <Slider.Range className="qsp-volume-slider-range" />
      </Slider.Track>
      <Slider.Thumb className="qsp-volume-slider-thumb" aria-label={t('Volume') || undefined} />
    </Slider.Root>
  );
};
