import { RouterProvider } from 'react-router-dom';
import { ErrorAlert } from './error-alert';
import { NoticeToast } from './notice-toast';
import { router } from './routes';

import './main.css';

export const QspiderRoot: React.FC = () => {
  return (
    <>
      <RouterProvider router={router} />
      <ErrorAlert />
      <NoticeToast />
    </>
  );
};
