import { Markup } from 'interweave';
import { transform } from './template-transformers';

const blockList = ['script'];

export const ContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  return <Markup content={content} transform={transform} blockList={blockList} noWrap allowElements allowAttributes />;
};
