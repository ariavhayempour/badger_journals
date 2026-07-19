export interface ResearchArea {
  icon: string;
  title: string;
  description: string;
}

// Expansion areas migrated verbatim from the legacy "Create the Next Digest" page.
export const researchAreas: ResearchArea[] = [
  { icon: '🦠', title: 'Infectious Disease', description: 'Emerging pathogens, antimicrobial resistance, virology, and vaccine development.' },
  { icon: '💊', title: 'Pharmacology', description: 'Drug discovery, clinical trials, pharmacogenomics, and translational medicine.' },
  { icon: '🌱', title: 'Environmental Science', description: 'Climate biology, ecology, conservation genomics, and environmental health.' },
  { icon: '🌍', title: 'Public Health', description: 'Epidemiology, health policy, disease prevention, and population health research.' },
  { icon: '🔬', title: 'Immunology', description: 'Autoimmune disease, T cell biology, innate immunity, and allergy research.' },
  { icon: '🤖', title: 'Computational Biology', description: 'Bioinformatics, AI in medicine, structural biology, and systems biology.' },
];
