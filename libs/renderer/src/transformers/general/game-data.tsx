import React from 'react';
import { Attributes, currentGameEntry$ } from '@qspider/game-state';
import { useAttributes } from '../../content/attributes';
import { useAtom } from '@xoid/react';
import { useTranslation } from 'react-i18next';
import { ContentRenderer } from '../../content-renderer';

export const QspGameTitle: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [t] = useTranslation();
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-game-title');
  const currentGame = useAtom(currentGameEntry$);
  return (
    <Tag {...attributes} style={style}>
      {currentGame?.author || t('n/a')}
    </Tag>
  );
};

export const QspGameAuthor: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [t] = useTranslation();
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-game-author');
  const currentGame = useAtom(currentGameEntry$);
  return (
    <Tag {...attributes} style={style}>
      {currentGame?.author || t('n/a')}
    </Tag>
  );
};

export const QspGameVersion: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [t] = useTranslation();
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-game-version');
  const currentGame = useAtom(currentGameEntry$);
  return (
    <Tag {...attributes} style={style}>
      {currentGame?.version || t('n/a')}
    </Tag>
  );
};

export const QspGameDescription: React.FC<{ attrs: Attributes }> = ({ attrs }) => {
  const [Tag, style, attributes] = useAttributes(attrs, 'qsp-game-description');
  const currentGame = useAtom(currentGameEntry$);
  return (
    <Tag {...attributes} style={style}>
      {currentGame?.description ? <ContentRenderer content={currentGame.description} /> : ''}
    </Tag>
  );
};
