import React from 'react';
import save from '../svg/save.svg';
import load from '../svg/load.svg';
import speaker from '../svg/speaker.svg';
import speakerOff from '../svg/speaker-off.svg';
import restart from '../svg/restart.svg';
import list from '../svg/list.svg';
import open from '../svg/open.svg';

import styled from '@emotion/styled';

const gpyphs = {
  save,
  load,
  speaker,
  speakerOff,
  restart,
  list,
  open,
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
