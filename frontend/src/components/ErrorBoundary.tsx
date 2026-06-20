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
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            background: "#000",
            color: "#FFB703",
            fontFamily: "inherit",
            textAlign: "center",
            padding: "2rem",
            zIndex: 9999,
          }}
        >
          <h1 style={{ fontSize: "1.5rem", letterSpacing: "0.05em" }}>Something went wrong.</h1>
          <p style={{ color: "#c8b6ff", maxWidth: "32rem" }}>
            This corner of the portfolio hit a snag. Reloading should fix it.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.6rem 1.4rem",
              borderRadius: "999px",
              border: "1px solid #FFB703",
              background: "transparent",
              color: "#FFB703",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
