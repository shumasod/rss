import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './presentation/App';
import { setupContainer } from './di/container';
import './index.css';

// DIコンテナの初期化
setupContainer();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
