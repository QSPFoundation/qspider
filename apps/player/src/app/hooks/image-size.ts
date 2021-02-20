import { useEffect, useState } from 'react';
import { useResources } from '../game/resource-manager';

interface Size {
  width: number;
  height: number;
}

const cache: Record<string, Size> = {};

export function useImageSize(url: string): Size {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const resources = useResources();

  useEffect(() => {
    if (url) {
      const cached = cache[url];
      if (cached) {
        setSize(cached);
      } else {
        const img = document.createElement('img');
        img.onload = () => {
          const size = {
            width: img.naturalWidth,
            height: img.naturalHeight,
          };
          cache[url] = size;
          setSize(size);
        };
        img.src = resources.get(url).url;
      }
    }
  }, [url, resources]);

  return size;
}
