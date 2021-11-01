import React from 'react';
import { useResources } from '../../game/resource-manager';

export const Video: React.FC<{
  src?: string;
  poster?: string;
  className?: string;
  style: React.CSSProperties;
}> = ({ src, poster, style, className, children }) => {
  const resources = useResources();

  return (
    <video
      className={className}
      src={src ? resources.get(src).url : undefined}
      poster={poster ? resources.get(poster).url : undefined}
      style={style}
      preload="auto"
      loop
      autoPlay
    >
      {children}
    </video>
  );
};
