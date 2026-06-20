import portfolioData from "./portfolio.json";
import { Profile, Professional, Personal, Emotional } from "@/types";

export const profile: Profile = portfolioData.profile;
export const professional: Professional = portfolioData.professional as Professional;
export const personal: Personal = portfolioData.personal as Personal;
export const emotional: Emotional = portfolioData.emotional;
