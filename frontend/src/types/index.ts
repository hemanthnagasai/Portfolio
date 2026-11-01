export interface Profile {
  firstName: string;
  middleName: string;
  lastName: string;
  tagline: string;
  origin: string;
  links: {
    linkedin: string;
    github: string;
    /** The AI tech page. */
    instagram: string;
    /** The singing page. */
    music: string;
  };
}

export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;
  sub?: string;
  bullets: string[];
}

export interface ProjectEntry {
  name: string;
  stack: string;
  desc: string;
  /** Professional-tone variant used by the résumé PDF; falls back to desc. */
  resumeDesc?: string;
}

export interface EducationEntry {
  degree: string;
  org: string;
  period: string;
  meta: string;
}

export interface CertEntry {
  name: string;
  org: string;
  /** "achievement" splits it out of Certifications on the recruiter page. */
  type?: "achievement";
}

export interface ResumeMeta {
  summary: string;
}

export interface Professional {
  kicker: string;
  heading: string[];
  quote: string;
  bio: string;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
  skills: string[];
  certs: CertEntry[];
}

export interface HobbyEntry {
  title: string;
  note: string;
}

export interface Personal {
  kicker: string;
  heading: string[];
  quote: string;
  bio: string;
  hobbies: HobbyEntry[];
  values: string[];
  closing: string;
}

export interface Emotional {
  kicker: string;
  heading: string;
  paragraphs: string[];
}
