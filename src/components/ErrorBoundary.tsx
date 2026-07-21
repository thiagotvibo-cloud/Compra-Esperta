import React, { Component, ErrorInfo, ReactNode } from "react";
interface Props {
  children?: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}
export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };
  public static getDerivedStateFromError(error: Error): State {
    /* Update state so the next render will show the fallback UI. */ return {
      hasError: true,
      error,
    };
  }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{ padding: "20px", textAlign: "center", marginTop: "50px" }}
        >
          {" "}
          <h1 style={{ color: "#F34E3A" }}>Ops! Algo deu errado.</h1>{" "}
          <p>
            O aplicativo encontrou um erro crítico e não pôde ser carregado.
          </p>{" "}
          <div
            style={{
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "8px",
              marginTop: "20px",
              textAlign: "left",
              overflow: "auto",
              color: "#333",
            }}
          >
            {" "}
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {" "}
              {this.state.error?.message || "Erro desconhecido"}{" "}
            </pre>{" "}
          </div>{" "}
          <p style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
            {" "}
            Por favor, verifique as configurações (como variáveis de ambiente no
            Vercel).{" "}
          </p>{" "}
        </div>
      );
    }
    return (this as any).props.children;
  }
}
