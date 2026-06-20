import { createContext, Dispatch, SetStateAction } from "react";

export interface DimensionContextType {
  dimension: string;
  setDimension: Dispatch<SetStateAction<string>>;
}

export const DimensionContext = createContext<DimensionContextType>({
  dimension: "gateway",
  setDimension: () => {},
});
