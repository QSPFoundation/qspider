import { useClickCoordinates } from './hooks/click-coordinates';

export const ClickCoordinates: React.FC = () => {
  const { x, y } = useClickCoordinates();
  const content = `qsp-game-root {--mouse-x: ${x}px;--mouse-y:${y}px;}`;
  return <style>{content}</style>;
};
