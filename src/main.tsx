import 'reflect-metadata';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './presentation/App';
import { setupContainer } from './di/container';
import './index.css';

try {
  console.log('🚀 Initializing RSS Feed Reader...');

  // DIコンテナの初期化
  console.log('📦 Setting up DI container...');
  setupContainer();
  console.log('✅ DI container initialized');

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  console.log('🎨 Rendering React app...');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Failed to initialize app:', error);

  // エラー表示
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 600px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        ">
          <h1 style="font-size: 2em; margin-bottom: 20px; color: #333;">
            ⚠️ 初期化エラー
          </h1>
          <p style="font-size: 1.1em; margin-bottom: 20px; color: #666;">
            アプリケーションの初期化中にエラーが発生しました。
          </p>
          <details style="
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            border: 1px solid #e9ecef;
          ">
            <summary style="cursor: pointer; font-weight: 600; color: #667eea;">
              エラー詳細
            </summary>
            <pre style="
              background: #f1f3f5;
              padding: 10px;
              border-radius: 5px;
              overflow: auto;
              font-size: 0.9em;
              color: #c33;
              margin-top: 10px;
              white-space: pre-wrap;
              word-break: break-word;
            ">${error instanceof Error ? error.message : String(error)}</pre>
            ${error instanceof Error && error.stack ? `
              <pre style="
                background: #f1f3f5;
                padding: 10px;
                border-radius: 5px;
                overflow: auto;
                font-size: 0.8em;
                color: #666;
                margin-top: 10px;
                white-space: pre-wrap;
                word-break: break-word;
              ">${error.stack}</pre>
            ` : ''}
          </details>
          <p style="font-size: 0.9em; color: #999; margin-top: 20px;">
            ブラウザのコンソールを確認してください（F12キー）
          </p>
          <button
            onclick="window.location.reload()"
            style="
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              border-radius: 25px;
              font-size: 1em;
              font-weight: 600;
              cursor: pointer;
              margin-top: 20px;
            "
          >
            ページを再読み込み
          </button>
        </div>
      </div>
    `;
  }
}
