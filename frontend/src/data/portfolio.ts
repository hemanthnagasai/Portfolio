import portfolioData from "./portfolio.json";
import { Profile, Professional, Personal, Emotional, ResumeMeta } from "@/types";

export const profile: Profile = portfolioData.profile;
export const resume: ResumeMeta = portfolioData.resume;
export const professional: Professional = portfolioData.professional as Professional;
export const personal: Personal = portfolioData.personal as Personal;
export const emotional: Emotional = portfolioData.emotional;
