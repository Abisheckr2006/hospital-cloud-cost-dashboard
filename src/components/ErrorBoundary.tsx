import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, ShieldAlert, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * Reusable React Error Boundary Component
 * 
 * Catches unexpected JavaScript runtime and rendering errors in child component trees,
 * logs diagnostic details safely without exposing sensitive environmental variables or API keys,
 * and renders a healthcare-styled fallback UI with recovery controls.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for telemetry/debugging
    console.error('Uncaught Error Boundary Exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV !== 'production';

      return (
        <div className="p-8 my-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-1">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  FinOps UI Error Boundary Shield
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5">
                  {this.props.fallbackTitle || 'Component Rendering Exception Caught'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  An unexpected rendering error occurred within this dashboard view. The core application context remains active.
                </p>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry View Component
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer border border-slate-700"
                >
                  <Home className="w-3.5 h-3.5" />
                  Reload Application
                </button>

                <button
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer ml-auto"
                >
                  {this.state.showDetails ? 'Hide Error Diagnostics' : 'Show Error Diagnostics'}
                </button>
              </div>

              {/* Diagnostic Technical Information */}
              {this.state.showDetails && (
                <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-rose-300 overflow-x-auto space-y-2">
                  <div className="font-semibold text-rose-400">
                    Error: {this.state.error?.message || 'Unknown Exception'}
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-[10px] text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                  {!isDev && (
                    <div className="text-[10px] text-slate-500 italic mt-1">
                      Note: Sensitive system environment variables and authorization credentials are redacted from client stack traces.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
