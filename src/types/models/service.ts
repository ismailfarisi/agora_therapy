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
  detailedDescription?: string;
  helpPoints?: string[];
  imageUrl?: string;
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
    detailedDescription: "Overcome anxiety and panic attacks with evidence-based therapeutic approaches. We help you understand your anxiety triggers and develop practical tools to manage symptoms.",
    helpPoints: [
      "Identify and understand anxiety triggers",
      "Learn relaxation and breathing techniques",
      "Develop cognitive strategies to manage anxious thoughts",
      "Build confidence in handling anxiety-provoking situations",
      "Create a personalized anxiety management toolkit"
    ],
  },
  {
    id: "depression",
    name: "Depression",
    description: "Support for depression, mood disorders, and emotional well-being",
    category: "mental-health",
    isActive: true,
    detailedDescription: "Find hope and healing from depression with compassionate, evidence-based therapy. Our therapists provide a safe space to explore your feelings and develop strategies for recovery.",
    helpPoints: [
      "Understand the root causes of your depression",
      "Develop healthy coping mechanisms and self-care routines",
      "Challenge negative thought patterns",
      "Rebuild motivation and find meaning in daily activities",
      "Create a sustainable path toward emotional well-being"
    ],
  },
  {
    id: "stress-management",
    name: "Stress Management",
    description: "Techniques for managing stress and building resilience",
    category: "mental-health",
    isActive: true,
    detailedDescription: "Learn effective strategies to manage daily stress, workplace pressure, and life challenges. Our therapists help you develop personalized coping mechanisms and build long-term resilience.",
    helpPoints: [
      "Identify workplace stressors and develop coping strategies",
      "Learn techniques for managing burnout and maintaining work-life balance",
      "Develop communication skills for difficult workplace situations",
      "Create personalized stress management plans",
      "Build resilience and emotional regulation skills"
    ],
  },
  {
    id: "ocd",
    name: "OCD",
    description: "Treatment for obsessive-compulsive disorder",
    category: "mental-health",
    isActive: true,
    detailedDescription: "Overcome obsessive-compulsive disorder with evidence-based treatment. We help you break free from intrusive thoughts and compulsive behaviors.",
    helpPoints: [
      "Understand OCD patterns and triggers",
      "Learn exposure and response prevention techniques",
      "Develop strategies to manage intrusive thoughts",
      "Reduce compulsive behaviors gradually",
      "Build confidence in managing OCD symptoms"
    ],
  },
  {
    id: "bipolar",
    name: "Bipolar Disorder",
    description: "Support for bipolar disorder management",
    category: "mental-health",
    isActive: true,
    detailedDescription: "Manage bipolar disorder with comprehensive therapeutic support. Learn to recognize mood patterns and develop effective coping strategies.",
    helpPoints: [
      "Recognize and track mood patterns",
      "Develop strategies for mood stabilization",
      "Learn to manage manic and depressive episodes",
      "Build healthy routines and sleep habits",
      "Create a support system and crisis plan"
    ],
  },

  // Trauma
  {
    id: "ptsd",
    name: "PTSD",
    description: "Treatment for post-traumatic stress disorder",
    category: "trauma",
    isActive: true,
    detailedDescription: "Heal from trauma with specialized PTSD treatment. We provide a safe space to process traumatic experiences and reduce symptoms.",
    helpPoints: [
      "Process traumatic memories safely",
      "Reduce flashbacks and nightmares",
      "Learn grounding and coping techniques",
      "Manage triggers and hypervigilance",
      "Rebuild sense of safety and control"
    ],
  },
  {
    id: "trauma-healing",
    name: "Trauma Healing",
    description: "Processing and healing from traumatic experiences",
    category: "trauma",
    isActive: true,
    detailedDescription: "Begin your healing journey from past trauma. We use evidence-based approaches to help you process and recover from traumatic experiences.",
    helpPoints: [
      "Process traumatic experiences at your own pace",
      "Develop healthy coping mechanisms",
      "Reduce emotional and physical symptoms",
      "Rebuild trust and relationships",
      "Reclaim your sense of self and empowerment"
    ],
  },
  {
    id: "grief-loss",
    name: "Grief & Loss",
    description: "Support through bereavement and loss",
    category: "trauma",
    isActive: true,
    detailedDescription: "Navigate the grieving process with compassionate support. We help you process loss and find meaning while honoring your loved ones.",
    helpPoints: [
      "Process grief in a healthy way",
      "Navigate different stages of mourning",
      "Find meaning and acceptance",
      "Maintain connections while moving forward",
      "Build resilience and hope for the future"
    ],
  },

  // Relationship
  {
    id: "couples-therapy",
    name: "Couples Therapy",
    description: "Relationship counseling and couples therapy",
    category: "relationship",
    isActive: true,
    detailedDescription: "Strengthen your relationship with professional couples therapy. We help partners improve communication, resolve conflicts, and rebuild intimacy.",
    helpPoints: [
      "Improve communication and active listening",
      "Resolve conflicts constructively",
      "Rebuild trust and intimacy",
      "Understand each other's needs better",
      "Develop shared goals and vision"
    ],
  },
  {
    id: "family-counseling",
    name: "Family Counseling",
    description: "Family therapy and conflict resolution",
    category: "relationship",
    isActive: true,
    detailedDescription: "Strengthen family bonds and resolve conflicts with professional family therapy. We help families improve communication and build healthier relationships.",
    helpPoints: [
      "Improve family communication patterns",
      "Resolve conflicts and misunderstandings",
      "Navigate family transitions and changes",
      "Strengthen parent-child relationships",
      "Create a more harmonious family environment"
    ],
  },
  {
    id: "divorce-support",
    name: "Divorce Support",
    description: "Guidance through separation and divorce",
    category: "relationship",
    isActive: true,
    detailedDescription: "Navigate divorce and separation with professional support. We help you process emotions, make decisions, and move forward positively.",
    helpPoints: [
      "Process emotions around separation",
      "Make informed decisions during divorce",
      "Co-parent effectively if children are involved",
      "Rebuild identity and self-worth",
      "Create a positive path forward"
    ],
  },
  {
    id: "parenting",
    name: "Parenting",
    description: "Parenting strategies and child behavior management",
    category: "relationship",
    isActive: true,
    detailedDescription: "Develop effective parenting strategies and build stronger relationships with your children. Get support for behavioral challenges and developmental concerns.",
    helpPoints: [
      "Learn positive discipline techniques",
      "Manage challenging behaviors effectively",
      "Improve parent-child communication",
      "Build emotional connection with children",
      "Navigate different developmental stages"
    ],
  },

  // Addiction
  {
    id: "substance-abuse",
    name: "Substance Abuse",
    description: "Treatment for alcohol and drug addiction",
    category: "addiction",
    isActive: true,
    detailedDescription: "Overcome substance abuse with compassionate, evidence-based treatment. We support your journey to recovery and long-term sobriety.",
    helpPoints: [
      "Understand addiction patterns and triggers",
      "Develop healthy coping mechanisms",
      "Build relapse prevention strategies",
      "Address underlying emotional issues",
      "Create a sustainable recovery plan"
    ],
  },
  {
    id: "behavioral-addiction",
    name: "Behavioral Addiction",
    description: "Treatment for gambling, gaming, and other behavioral addictions",
    category: "addiction",
    isActive: true,
    detailedDescription: "Break free from behavioral addictions like gambling, gaming, or shopping. We help you regain control and build healthier habits.",
    helpPoints: [
      "Identify triggers and patterns",
      "Develop impulse control strategies",
      "Replace addictive behaviors with healthy activities",
      "Address underlying emotional needs",
      "Build accountability and support systems"
    ],
  },

  // Wellness
  {
    id: "self-esteem",
    name: "Self-Esteem",
    description: "Building confidence and self-worth",
    category: "wellness",
    isActive: true,
    detailedDescription: "Build lasting confidence and self-worth. We help you challenge negative self-beliefs and develop a positive self-image.",
    helpPoints: [
      "Challenge negative self-talk and beliefs",
      "Identify and build on your strengths",
      "Set and achieve personal goals",
      "Develop assertiveness and boundaries",
      "Cultivate self-compassion and acceptance"
    ],
  },
  {
    id: "life-coaching",
    name: "Life Coaching",
    description: "Goal setting and personal development",
    category: "wellness",
    isActive: true,
    detailedDescription: "Achieve your personal and professional goals with expert life coaching. We help you clarify your vision and create actionable plans.",
    helpPoints: [
      "Clarify your values and life vision",
      "Set meaningful and achievable goals",
      "Overcome obstacles and limiting beliefs",
      "Develop action plans and accountability",
      "Create lasting positive change"
    ],
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    description: "Meditation and mindfulness practices",
    category: "wellness",
    isActive: true,
    detailedDescription: "Learn mindfulness and meditation practices to reduce stress and increase well-being. Develop present-moment awareness and inner peace.",
    helpPoints: [
      "Learn meditation and breathing techniques",
      "Develop present-moment awareness",
      "Reduce stress and anxiety naturally",
      "Improve emotional regulation",
      "Cultivate inner peace and clarity"
    ],
  },
  {
    id: "sleep-issues",
    name: "Sleep Issues",
    description: "Treatment for insomnia and sleep disorders",
    category: "wellness",
    isActive: true,
    detailedDescription: "Overcome insomnia and sleep disorders with cognitive-behavioral therapy. Develop healthy sleep habits and improve sleep quality.",
    helpPoints: [
      "Identify and address sleep disruptors",
      "Develop healthy sleep hygiene habits",
      "Learn relaxation techniques for better sleep",
      "Address anxiety and thoughts that prevent sleep",
      "Create a sustainable sleep routine"
    ],
  },

  // Specialized
  {
    id: "eating-disorders",
    name: "Eating Disorders",
    description: "Treatment for anorexia, bulimia, and binge eating",
    category: "specialized",
    isActive: true,
    detailedDescription: "Recover from eating disorders with specialized, compassionate treatment. We address both the physical and emotional aspects of eating disorders.",
    helpPoints: [
      "Develop a healthy relationship with food",
      "Address underlying emotional issues",
      "Challenge distorted body image thoughts",
      "Build healthy eating patterns",
      "Create a comprehensive recovery plan"
    ],
  },
  {
    id: "adhd",
    name: "ADHD",
    description: "Support for attention deficit hyperactivity disorder",
    category: "specialized",
    isActive: true,
    detailedDescription: "Get specialized support for ADHD management in children and adults. Learn strategies to improve focus, organization, and daily functioning.",
    helpPoints: [
      "Develop organizational and time management skills",
      "Learn strategies to improve focus and attention",
      "Manage impulsivity and emotional regulation",
      "Create structured routines and systems",
      "Build self-esteem and coping strategies"
    ],
  },
  {
    id: "autism",
    name: "Autism Spectrum",
    description: "Support for autism spectrum disorders",
    category: "specialized",
    isActive: true,
    detailedDescription: "Specialized support for individuals on the autism spectrum and their families. We help develop social skills, manage sensory issues, and navigate daily challenges.",
    helpPoints: [
      "Develop social communication skills",
      "Manage sensory sensitivities",
      "Build coping strategies for transitions",
      "Support family understanding and communication",
      "Enhance independence and life skills"
    ],
  },
  {
    id: "lgbtq",
    name: "LGBTQ+ Issues",
    description: "Affirming therapy for LGBTQ+ individuals",
    category: "specialized",
    isActive: true,
    detailedDescription: "Affirming, culturally-competent therapy for LGBTQ+ individuals. We provide a safe space to explore identity, relationships, and mental health.",
    helpPoints: [
      "Explore and affirm your identity",
      "Navigate coming out and family dynamics",
      "Address discrimination and minority stress",
      "Build healthy relationships",
      "Develop resilience and self-acceptance"
    ],
  },
  {
    id: "chronic-illness",
    name: "Chronic Illness",
    description: "Coping with chronic health conditions",
    category: "specialized",
    isActive: true,
    detailedDescription: "Navigate the emotional challenges of living with chronic illness. We help you cope with pain, uncertainty, and lifestyle changes.",
    helpPoints: [
      "Process emotions around diagnosis and limitations",
      "Develop pain and symptom management strategies",
      "Maintain quality of life and relationships",
      "Build resilience and acceptance",
      "Create meaning and purpose despite challenges"
    ],
  },
  {
    id: "career-counseling",
    name: "Career Counseling",
    description: "Career guidance and workplace issues",
    category: "specialized",
    isActive: true,
    detailedDescription: "Navigate career transitions, workplace challenges, and professional growth with expert guidance. We help you align your career with your values and aspirations.",
    helpPoints: [
      "Explore career options and identify your strengths",
      "Develop strategies for career advancement",
      "Navigate workplace conflicts and politics",
      "Build confidence in professional settings",
      "Create actionable career development plans"
    ],
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
