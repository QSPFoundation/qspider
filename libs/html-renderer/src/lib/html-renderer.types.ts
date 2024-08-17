export interface MarkupProps {
  content: RenderNode[];
  /** Content to render when the `content` prop is empty. */
  emptyContent?: React.ReactNode;
}

export interface NodeConfig {
  // Only children
  children: string[];
  // Children content type
  content: number;
  // Invalid children
  invalid: string[];
  // Only parent
  parent: string[];
  // Can render self as a child
  self: boolean;
  // HTML tag name
  tagName: string;
  // Self content type
  type: number;
  // Self-closing tag
  void: boolean;
}
export type ConfigMap = Record<string, Partial<NodeConfig>>;

export type FilterMap = Record<string, number>;

export type RenderNode = React.ReactElement<unknown> | string | null;

export type AttributeValue = boolean | number | object | string;

export type Attributes = Record<string, AttributeValue>;

export interface ElementProps {
  [prop: string]: unknown;
  attributes?: Attributes;
  className?: string;
  children?: React.ReactNode;
  selfClose?: boolean;
  tagName: string;
}

export type TransformCallback = (node: HTMLElement, RenderNode: RenderNode[], config: NodeConfig) => RenderNode;

export interface ParserProps {
  /** List of HTML tag names to allow and render. Defaults to the `ALLOWED_TAG_LIST` constant. */
  allowList?: string[];
  /** List of HTML tag names to disallow and not render. Overrides allow list. */
  blockList?: string[];
  /** Transformer ran on each HTML element. Return a new element, null to remove current element, or undefined to do nothing. */
  transform?: TransformCallback;
}
