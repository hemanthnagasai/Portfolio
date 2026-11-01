import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in app tree:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="scene scene-orange fixed inset-0 z-[9999] flex items-center px-[var(--page-x)]">
          <div className="max-w-[32rem]">
            <h1 className="mega text-[clamp(2.75rem,8vw,5rem)]">Something went wrong.</h1>
            <p className="lead text-xl mt-6">
              This page of the portfolio hit a snag. Reloading usually fixes it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn fill-ink mt-8"
            >
              Reload the page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
