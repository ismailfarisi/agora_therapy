/**
 * Service Model
 * Therapy services/specialties offered
 */

export interface Service {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: ServiceCategory;
  isActive: boolean;
}

export type ServiceCategory = 
  | "mental-health"
  | "relationship"
  | "addiction"
  | "trauma"
  | "wellness"
  | "specialized";

export const AVAILABLE_SERVICES: Service[] = [
  // Mental Health
  {
    id: "anxiety",
    name: "Anxiety",
    description: "Treatment for anxiety disorders, panic attacks, and stress management",
    category: "mental-health",
    isActive: true,
  },
  {
    id: "depression",
    name: "Depression",
    description: "Support for depression, mood disorders, and emotional well-being",
    category: "mental-health",
    isActive: true,
  },
  {
    id: "stress-management",
    name: "Stress Management",
    description: "Techniques for managing stress and building resilience",
    category: "mental-health",
    isActive: true,
  },
  {
    id: "ocd",
    name: "OCD",
    description: "Treatment for obsessive-compulsive disorder",
    category: "mental-health",
    isActive: true,
  },
  {
    id: "bipolar",
    name: "Bipolar Disorder",
    description: "Support for bipolar disorder management",
    category: "mental-health",
    isActive: true,
  },

  // Trauma
  {
    id: "ptsd",
    name: "PTSD",
    description: "Treatment for post-traumatic stress disorder",
    category: "trauma",
    isActive: true,
  },
  {
    id: "trauma-healing",
    name: "Trauma Healing",
    description: "Processing and healing from traumatic experiences",
    category: "trauma",
    isActive: true,
  },
  {
    id: "grief-loss",
    name: "Grief & Loss",
    description: "Support through bereavement and loss",
    category: "trauma",
    isActive: true,
  },

  // Relationship
  {
    id: "couples-therapy",
    name: "Couples Therapy",
    description: "Relationship counseling and couples therapy",
    category: "relationship",
    isActive: true,
  },
  {
    id: "family-counseling",
    name: "Family Counseling",
    description: "Family therapy and conflict resolution",
    category: "relationship",
    isActive: true,
  },
  {
    id: "divorce-support",
    name: "Divorce Support",
    description: "Guidance through separation and divorce",
    category: "relationship",
    isActive: true,
  },
  {
    id: "parenting",
    name: "Parenting",
    description: "Parenting strategies and child behavior management",
    category: "relationship",
    isActive: true,
  },

  // Addiction
  {
    id: "substance-abuse",
    name: "Substance Abuse",
    description: "Treatment for alcohol and drug addiction",
    category: "addiction",
    isActive: true,
  },
  {
    id: "behavioral-addiction",
    name: "Behavioral Addiction",
    description: "Treatment for gambling, gaming, and other behavioral addictions",
    category: "addiction",
    isActive: true,
  },

  // Wellness
  {
    id: "self-esteem",
    name: "Self-Esteem",
    description: "Building confidence and self-worth",
    category: "wellness",
    isActive: true,
  },
  {
    id: "life-coaching",
    name: "Life Coaching",
    description: "Goal setting and personal development",
    category: "wellness",
    isActive: true,
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    description: "Meditation and mindfulness practices",
    category: "wellness",
    isActive: true,
  },
  {
    id: "sleep-issues",
    name: "Sleep Issues",
    description: "Treatment for insomnia and sleep disorders",
    category: "wellness",
    isActive: true,
  },

  // Specialized
  {
    id: "eating-disorders",
    name: "Eating Disorders",
    description: "Treatment for anorexia, bulimia, and binge eating",
    category: "specialized",
    isActive: true,
  },
  {
    id: "adhd",
    name: "ADHD",
    description: "Support for attention deficit hyperactivity disorder",
    category: "specialized",
    isActive: true,
  },
  {
    id: "autism",
    name: "Autism Spectrum",
    description: "Support for autism spectrum disorders",
    category: "specialized",
    isActive: true,
  },
  {
    id: "lgbtq",
    name: "LGBTQ+ Issues",
    description: "Affirming therapy for LGBTQ+ individuals",
    category: "specialized",
    isActive: true,
  },
  {
    id: "chronic-illness",
    name: "Chronic Illness",
    description: "Coping with chronic health conditions",
    category: "specialized",
    isActive: true,
  },
  {
    id: "career-counseling",
    name: "Career Counseling",
    description: "Career guidance and workplace issues",
    category: "specialized",
    isActive: true,
  },
];

export const SERVICE_CATEGORIES = [
  { value: "mental-health", label: "Mental Health" },
  { value: "relationship", label: "Relationship & Family" },
  { value: "addiction", label: "Addiction & Recovery" },
  { value: "trauma", label: "Trauma & PTSD" },
  { value: "wellness", label: "Wellness & Growth" },
  { value: "specialized", label: "Specialized Services" },
] as const;

export function getServicesByCategory(category: ServiceCategory): Service[] {
  return AVAILABLE_SERVICES.filter(s => s.category === category && s.isActive);
}

export function getServiceById(id: string): Service | undefined {
  return AVAILABLE_SERVICES.find(s => s.id === id);
}

export function getServicesByIds(ids: string[]): Service[] {
  return AVAILABLE_SERVICES.filter(s => ids.includes(s.id));
}
