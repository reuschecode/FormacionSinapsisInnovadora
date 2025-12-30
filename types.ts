
export enum Section {
  HERO = 'hero',
  PROBLEM = 'problem',
  TARGET = 'target',
  COMPARISON = 'comparison',
  AGENDA = 'agenda',
  SPEAKER = 'speaker',
  FAQ = 'faq'
}

export type ModalType = 
  | 'REGISTRATION' 
  | 'METHODOLOGY' 
  | 'MATRIX' 
  | 'EBITDA_LOGIC' 
  | 'HYPE_FILTER' 
  | 'STEP_01'
  | 'STEP_03'
  | 'CASE_RETAIL'
  | 'CASE_FINTECH'
  | 'PROBLEM_INVISIBLE'
  | 'PROBLEM_HYPE'
  | 'PROBLEM_COMPLEXITY'
  | null;

export interface ROIDiagnostic {
  category: 'VALUE' | 'LEAKAGE';
  reasoning: string;
  recommendation: string;
  roiEstimate: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
