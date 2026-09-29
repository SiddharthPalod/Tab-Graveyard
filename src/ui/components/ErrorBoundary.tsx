import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Tab Graveyard ErrorBoundary caught error]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-[420px] h-[560px] bg-[#14131D] text-white p-4 flex flex-col justify-center items-center font-sans space-y-3">
          <div className="text-3xl">💀</div>
          <h2 className="font-pixel text-[9px] text-rpg-soul tracking-wider text-center">
            * AN UNEXPECTED ANOMALY OCCURRED
          </h2>
          <div className="p-2 bg-rpg-dark-gray border border-rpg-border text-xs text-rose-300 max-h-48 overflow-auto w-full font-mono break-all rounded-sm">
            {this.state.error?.message || 'Unknown render exception'}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="font-pixel text-[8px] bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 cursor-pointer rounded-none shadow-pixel"
          >
            [REVIVE EXTENSION]
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
