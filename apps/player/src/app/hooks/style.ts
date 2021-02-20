import { useResources } from '../game/resource-manager';

export const useStyle = (style: React.CSSProperties): React.CSSProperties => {
  const resources = useResources();
  if (style.backgroundImage && !style.backgroundImage.startsWith('url(')) {
    style.backgroundImage = `url(${resources.get(style.backgroundImage).url})`;
  }
  return style;
};
