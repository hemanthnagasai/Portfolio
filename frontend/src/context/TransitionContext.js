import { createContext } from "react";

export const TransitionContext = createContext({
  trigger: () => {},
  state: { phase: "idle" },
});
