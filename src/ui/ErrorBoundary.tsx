import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : String(err) };
  }

  componentDidCatch(error: unknown, info: any) {
    // Ushobora no kohereza Sentry/Apm hano
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:16,color:'#fff'}}>
          <h2>Something went wrong.</h2>
          <pre style={{whiteSpace:'pre-wrap',opacity:.8}}>
            {this.state.message || 'Unknown error'}
          </pre>
          <p className="small" style={{opacity:.7}}>
            (Check browser console for details)
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
