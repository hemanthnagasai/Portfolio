import { createContext } from "react";

export interface TransitionState {
  phase: string;
  color?: string;
  cx?: number;
  cy?: number;
  to?: string;
}

export interface TransitionContextType {
  state: TransitionState;
  setState: React.Dispatch<React.SetStateAction<TransitionState>>;
  trigger: (params: { rect: DOMRect; color: string; to: string }) => void;
}

export const TransitionContext = createContext<TransitionContextType>({
  state: { phase: "idle" },
  setState: () => {},
  trigger: () => {},
});
