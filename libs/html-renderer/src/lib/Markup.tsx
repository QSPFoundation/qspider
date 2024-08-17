import React from 'react';
import { MarkupProps } from './html-renderer.types';

export const Markup: React.FC<MarkupProps> = function (props) {
  const { content } = props;
  const mainContent = content.length === 1 ? content[0] : content;
  return <>{mainContent}</>;
};
