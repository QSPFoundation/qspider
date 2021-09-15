import React from 'react';
import ReactDOM from 'react-dom';
import 'mobx-react-lite/batchingForReactDom';

import './scroll.css';
import './main.css';

import { App } from './app/app';

ReactDOM.render(<App />, document.getElementById('root'));
