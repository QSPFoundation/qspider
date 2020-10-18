import React from 'react';
import save from '../../../assets/svg/save.svg';
import load from '../../../assets/svg/load.svg';
import speaker from '../../../assets/svg/speaker.svg';
import speakerOff from '../../../assets/svg/speaker-off.svg';
import restart from '../../../assets/svg/restart.svg';
import list from '../../../assets/svg/list.svg';

import styled from '@emotion/styled';

const gpyphs = {
  save,
  load,
  speaker,
  speakerOff,
  restart,
  list,
};

const IconSvg = styled.svg`
  width: 32px;
  height: 32px;
`;

export const Icon: React.FC<{ icon: string }> = ({ icon }) => {
  const gpyph = gpyphs[icon];
  if (!gpyph) return null;
  return (
    <IconSvg viewBox={gpyph.viewBox}>
      <use href={`#${gpyph.id}`} />
    </IconSvg>
  );
};
