export function isHtmlElement(node: Node): node is HTMLElement {
  return node.nodeType === 1;
}

export function isTextNode(node: Node): node is Text {
  return node.nodeType === 3;
}
