import './core.css';
import { isTouchDevice } from '@qspider/utils';
import { TouchPauseButton } from './touch-pause-button';

export const QspiderRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      {isTouchDevice() && <TouchPauseButton />}
    </>
  );
};
