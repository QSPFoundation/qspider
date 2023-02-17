import { ErrorAlert } from './error-alert';
import { NoticeToast } from './notice-toast';

import './main.css';

export const QspiderRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <ErrorAlert />
      <NoticeToast />
    </>
  );
};
