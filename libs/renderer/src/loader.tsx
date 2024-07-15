import { useAtom } from '@xoid/react';
import { atom } from 'xoid';

export const loadingMessage$ = atom('');

export const QspiderLoader: React.FC = () => {
  const loadingMessage = useAtom(loadingMessage$);
  return (
    <div className="q-loader">
      <div className="q-book">
        <div className="q-inner">
          <div className="q-left"></div> <div className="q-middle"></div> <div className="q-right"></div>
        </div>
        <ul>
          <li></li> <li></li> <li></li> <li></li> <li></li> <li></li> <li></li> <li></li> <li></li> <li></li> <li></li>
          <li></li> <li></li> <li></li> <li></li> <li></li> <li></li> <li></li>
        </ul>
      </div>
      {loadingMessage && <div className="q-loader__message">{loadingMessage}</div>}
    </div>
  );
};
