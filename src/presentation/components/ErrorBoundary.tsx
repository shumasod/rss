import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 * Reactのエラーバウンダリー実装
 * 予期しないエラーをキャッチしてアプリケーションのクラッシュを防ぐ
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    // アプリケーションをリロード
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h1 style={styles.title}>⚠️ エラーが発生しました</h1>
            <p style={styles.message}>
              申し訳ございません。予期しないエラーが発生しました。
            </p>
            {this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>エラー詳細</summary>
                <pre style={styles.pre}>{this.state.error.message}</pre>
                {this.state.error.stack && (
                  <pre style={styles.stack}>{this.state.error.stack}</pre>
                )}
              </details>
            )}
            <button onClick={this.handleReset} style={styles.button}>
              アプリケーションを再起動
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  content: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '600px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: '2em',
    marginBottom: '20px',
    color: '#333',
  },
  message: {
    fontSize: '1.1em',
    marginBottom: '20px',
    color: '#666',
  },
  details: {
    marginTop: '20px',
    marginBottom: '20px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #e9ecef',
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 600,
    color: '#667eea',
    marginBottom: '10px',
  },
  pre: {
    background: '#f1f3f5',
    padding: '10px',
    borderRadius: '5px',
    overflow: 'auto',
    fontSize: '0.9em',
    color: '#c33',
    marginTop: '10px',
  },
  stack: {
    background: '#f1f3f5',
    padding: '10px',
    borderRadius: '5px',
    overflow: 'auto',
    fontSize: '0.8em',
    color: '#666',
    marginTop: '10px',
  },
  button: {
    padding: '12px 30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '1em',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
};
