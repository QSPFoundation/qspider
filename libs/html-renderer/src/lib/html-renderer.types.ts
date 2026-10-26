export interface MarkupProps {
  content: RenderNode[];
  /** Content to render when the `content` prop is empty. */
  emptyContent?: React.ReactNode;
}

export type RenderNode = React.ReactElement<unknown> | string | null;

export type TransformCallback = (node: HTMLElement, children: RenderNode[]) => RenderNode;

export interface ParserProps {
  /** Transformer ran on each HTML element. Return a new element, or null to remove the current element. */
  transform: TransformCallback;
}
