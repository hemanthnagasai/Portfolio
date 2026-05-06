import { createContext } from "react";

export const DimensionContext = createContext({
  dimension: "gateway",
  setDimension: () => {},
});
