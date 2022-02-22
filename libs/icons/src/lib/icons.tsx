import React from 'react';
import save from '../svg/save.svg';
import load from '../svg/load.svg';
import speaker from '../svg/speaker.svg';
import speakerOff from '../svg/speaker-off.svg';
import restart from '../svg/restart.svg';
import list from '../svg/list.svg';
import open from '../svg/open.svg';
import upload from '../svg/upload.svg';
import tools from '../svg/spanner.svg';

import styled from '@emotion/styled';

export enum IconType {
  save = 'save',
  load = 'load',
  speaker = 'speaker',
  speakerOff = 'speakerOff',
  restart = 'restart',
  list = 'list',
  open = 'open',
  upload = 'upload',
  tools = 'tools',
}

const glyphs: Record<IconType, string> = {
  save,
  load,
  speaker,
  speakerOff,
  restart,
  list,
  open,
  upload,
  tools,
};

const IconSvg = styled.svg`
  width: 32px;
  height: 32px;
`;

export const Icon: React.FC<{ icon: IconType }> = ({ icon }) => {
  const gpyph: { id: string; viewBox: string } | undefined = glyphs[icon] as unknown as { id: string; viewBox: string };
  if (!gpyph) return null;
  return (
    <IconSvg viewBox={gpyph.viewBox}>
      <use href={`#${gpyph.id}`} />
    </IconSvg>
  );
};
