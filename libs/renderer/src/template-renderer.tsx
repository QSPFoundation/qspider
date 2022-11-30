import { Markup } from 'interweave';
import { transform } from './template-transformers';

const blockList = ['script'];

export const TemplateRenderer: React.FC<{ template: string }> = ({ template }) => {
  return (
    <Markup
      content={template}
      transform={transform}
      blockList={blockList}
      noWrap
      allowElements
      allowAttributes
      disableLineBreaks
    />
  );
};
