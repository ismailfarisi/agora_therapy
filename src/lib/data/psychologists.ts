export interface Language {
  name: string;
  code: string;
  proficiency: 'native' | 'fluent' | 'conversational';
}

export interface Specialization {
  id: string;
  name: string;
  description: string;
}

export interface Psychologist {
  id: string;
  name: string;
  title: string;
  image: string;
  languages: Language[];
  specializations: string[];
  experience: number;
  bio: string;
  education: string[];
  calendlyLink: string;
  rating: number;
  reviewCount: number;
  availableSlots?: string[];
}

export const specializations: Specialization[] = [
  {
    id: 'job-stress',
    name: 'Job Stress',
    description: 'Help managing workplace stress, burnout, and maintaining work-life balance.'
  },
  {
    id: 'career-building',
    name: 'Career Building',
    description: 'Guidance for career decisions, professional growth, and workplace challenges.'
  },
  {
    id: 'family-orientation',
    name: 'Family Orientation',
    description: 'Support for family dynamics, parenting challenges, and relationship issues.'
  },
  {
    id: 'learning-disabilities',
    name: 'Learning Disabilities',
    description: 'Specialized help for dyslexia, ADHD, and other learning challenges.'
  },
  {
    id: 'anxiety',
    name: 'Anxiety',
    description: 'Treatment for anxiety disorders, panic attacks, and stress management.'
  },
  {
    id: 'depression',
    name: 'Depression',
    description: 'Support for depression, mood disorders, and emotional well-being.'
  }
];

export const psychologists: Psychologist[] = [
  {
    id: 'soney-george',
    name: 'Soney George',
    title: 'Psychologist',
    image: '/images/psychologists/soney-george.jpeg',
    languages: [
      { name: 'Malayalam', code: 'ml', proficiency: 'native' },
      { name: 'English', code: 'en', proficiency: 'fluent' },

    ],
    specializations: ['job-stress', 'anxiety', 'depression'],
    experience: 12,
    bio: 'Soney George is a  psychologist with over 12 years of experience helping individuals overcome workplace stress and anxiety. She specializes in cognitive behavioral therapy and mindfulness-based approaches.',
    education: [
      'Ph.D. in Clinical Psychology, University of Kerala',
      'M.Phil. in Clinical Psychology, NIMHANS Bangalore'
    ],
    calendlyLink: 'https://calendly.com/bibychackokply',
    rating: 4.9,
    reviewCount: 124
  },
  {
    id: 'dr-akhil',
    name: 'Dr. Akhil',
    title: 'Counseling Psychologist',
    image: '/images/psychologists/akhil.jpeg',
    languages: [
      { name: 'Malayalam', code: 'ml', proficiency: 'native' },
      { name: 'English', code: 'en', proficiency: 'fluent' }
    ],
    specializations: ['job-stress', 'family-orientation'],
    experience: 8,
    bio: 'Dr. Akhil specializes in career counseling and family therapy. With 8 years of experience, he helps clients navigate career transitions and improve family relationships using solution-focused approaches.',
    education: [
      'M.A. in Counseling Psychology, Delhi University',
      'Certification in Family Systems Therapy'
    ],
    calendlyLink: 'https://calendly.com/dr-rajesh-kumar',
    rating: 4.7,
    reviewCount: 98
  },
  {
    id: 'dr-lakshmi-menon',
    name: 'Dr. Lakshmi Menon',
    title: 'Child Psychologist',
    image: '/images/psychologists/lakshmi-menon.jpg',
    languages: [
      { name: 'Malayalam', code: 'ml', proficiency: 'native' },
      { name: 'Tamil', code: 'ta', proficiency: 'native' },
      { name: 'English', code: 'en', proficiency: 'fluent' }
    ],
    specializations: ['learning-disabilities', 'family-orientation'],
    experience: 15,
    bio: 'Dr. Lakshmi Menon is a child psychologist with 15 years of experience specializing in learning disabilities, particularly dyslexia and ADHD. She works closely with children and families to develop personalized intervention strategies.',
    education: [
      'Ph.D. in Child Psychology, Madras University',
      'Specialized Training in Learning Disability Assessment and Intervention'
    ],
    calendlyLink: 'https://calendly.com/dr-lakshmi-menon',
    rating: 4.8,
    reviewCount: 156
  },
  {
    id: 'dr-anand-sharma',
    name: 'Dr. Anand Sharma',
    title: 'Organizational Psychologist',
    image: '/images/psychologists/anand-sharma.jpg',
    languages: [
      { name: 'Hindi', code: 'hi', proficiency: 'native' },
      { name: 'English', code: 'en', proficiency: 'fluent' },
      { name: 'Kannada', code: 'kn', proficiency: 'conversational' }
    ],
    specializations: ['job-stress', 'career-building'],
    experience: 10,
    bio: 'Dr. Anand Sharma is an organizational psychologist who helps professionals manage workplace stress and build fulfilling careers. He specializes in executive coaching and workplace wellness programs.',
    education: [
      'Ph.D. in Organizational Psychology, IIT Delhi',
      'MBA in Human Resources, IIM Bangalore'
    ],
    calendlyLink: 'https://calendly.com/dr-anand-sharma',
    rating: 4.6,
    reviewCount: 87
  },
  {
    id: 'dr-meena-reddy',
    name: 'Dr. Meena Reddy',
    title: 'Clinical Psychologist',
    image: '/images/psychologists/meena-reddy.jpg',
    languages: [
      { name: 'Telugu', code: 'te', proficiency: 'native' },
      { name: 'English', code: 'en', proficiency: 'fluent' },
      { name: 'Hindi', code: 'hi', proficiency: 'conversational' }
    ],
    specializations: ['anxiety', 'depression', 'family-orientation'],
    experience: 9,
    bio: 'Dr. Meena Reddy is a clinical psychologist specializing in anxiety disorders and family therapy. She integrates traditional and modern therapeutic approaches to provide holistic care to her clients.',
    education: [
      'M.Phil. in Clinical Psychology, University of Hyderabad',
      'Certification in Cognitive Behavioral Therapy'
    ],
    calendlyLink: 'https://calendly.com/dr-meena-reddy',
    rating: 4.8,
    reviewCount: 112
  },
  {
    id: 'dr-suresh-pillai',
    name: 'Dr. Suresh Pillai',
    title: 'Educational Psychologist',
    image: '/images/psychologists/suresh-pillai.jpg',
    languages: [
      { name: 'Malayalam', code: 'ml', proficiency: 'native' },
      { name: 'English', code: 'en', proficiency: 'fluent' },
      { name: 'Tamil', code: 'ta', proficiency: 'fluent' }
    ],
    specializations: ['learning-disabilities', 'career-building'],
    experience: 14,
    bio: 'Dr. Suresh Pillai specializes in educational psychology with a focus on learning disabilities and career guidance for young adults. He has developed several innovative assessment tools for identifying learning challenges.',
    education: [
      'Ph.D. in Educational Psychology, University of Calicut',
      'Specialized Training in Psychoeducational Assessment'
    ],
    calendlyLink: 'https://calendly.com/dr-suresh-pillai',
    rating: 4.9,
    reviewCount: 143
  }
];

export const languages = [
  { name: 'Malayalam', code: 'ml' },
  { name: 'Tamil', code: 'ta' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Telugu', code: 'te' },
  { name: 'Kannada', code: 'kn' },
  { name: 'English', code: 'en' }
];

export function getPsychologistById(id: string): Psychologist | undefined {
  return psychologists.find(psych => psych.id === id);
}

export function getPsychologistsByLanguage(languageCode: string): Psychologist[] {
  return psychologists.filter(psych => 
    psych.languages.some(lang => lang.code === languageCode)
  );
}

export function getPsychologistsBySpecialization(specializationId: string): Psychologist[] {
  return psychologists.filter(psych => 
    psych.specializations.includes(specializationId)
  );
}
