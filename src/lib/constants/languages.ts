/**
 * Comprehensive Language List
 * Includes all major Indian languages and international languages
 */

export interface Language {
  code: string;
  name: string;
  nativeName?: string;
  region: string;
}

export const LANGUAGES: Language[] = [
  // Indian Languages (Official and Regional)
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", region: "India" },
  { code: "en", name: "English", region: "India" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", region: "India" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", region: "India" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", region: "India" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", region: "India" },
  { code: "ur", name: "Urdu", nativeName: "اردو", region: "India" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", region: "India" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", region: "India" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", region: "India" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", region: "India" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", region: "India" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", region: "India" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", region: "India" },
  { code: "kok", name: "Konkani", nativeName: "कोंकणी", region: "India" },

  
  // South Asian Languages
  { code: "si", name: "Sinhala", nativeName: "සිංහල", region: "South Asia" },
  { code: "dv", name: "Dhivehi", nativeName: "ދިވެހި", region: "South Asia" },
  
  // Major International Languages
  { code: "zh", name: "Chinese (Mandarin)", nativeName: "中文", region: "International" },
  { code: "es", name: "Spanish", nativeName: "Español", region: "International" },
  { code: "ar", name: "Arabic", nativeName: "العربية", region: "International" },
  { code: "fr", name: "French", nativeName: "Français", region: "International" },
  { code: "de", name: "German", nativeName: "Deutsch", region: "International" },
  { code: "ja", name: "Japanese", nativeName: "日本語", region: "International" },
  { code: "pt", name: "Portuguese", nativeName: "Português", region: "International" },
  { code: "ru", name: "Russian", nativeName: "Русский", region: "International" },
  { code: "it", name: "Italian", nativeName: "Italiano", region: "International" },
  { code: "ko", name: "Korean", nativeName: "한국어", region: "International" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", region: "International" },
  { code: "pl", name: "Polish", nativeName: "Polski", region: "International" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", region: "International" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", region: "International" },
  { code: "th", name: "Thai", nativeName: "ไทย", region: "International" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", region: "International" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", region: "International" },
  { code: "fa", name: "Persian", nativeName: "فارسی", region: "International" },
  { code: "he", name: "Hebrew", nativeName: "עברית", region: "International" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", region: "International" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", region: "International" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", region: "International" },
  { code: "da", name: "Danish", nativeName: "Dansk", region: "International" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", region: "International" },
  { code: "cs", name: "Czech", nativeName: "Čeština", region: "International" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", region: "International" },
  { code: "ro", name: "Romanian", nativeName: "Română", region: "International" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", region: "International" },
];

// Group languages by region
export const LANGUAGE_GROUPS = LANGUAGES.reduce((acc, lang) => {
  if (!acc[lang.region]) {
    acc[lang.region] = [];
  }
  acc[lang.region].push(lang);
  return acc;
}, {} as Record<string, Language[]>);

// Get language name by code
export function getLanguageName(code: string): string {
  const lang = LANGUAGES.find((l) => l.code === code);
  return lang?.name || code;
}

// Get language by code
export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code === code);
}

// Get languages by codes
export function getLanguagesByCodes(codes: string[]): Language[] {
  return LANGUAGES.filter((l) => codes.includes(l.code));
}

// Popular Indian languages (for quick selection)
export const POPULAR_INDIAN_LANGUAGES = [
  "en", // English
  "hi", // Hindi
  "bn", // Bengali
  "te", // Telugu
  "mr", // Marathi
  "ta", // Tamil
  "gu", // Gujarati
  "kn", // Kannada
  "ml", // Malayalam
  "pa", // Punjabi
];
