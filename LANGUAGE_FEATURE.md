# Language Multi-Select Feature

## Overview
Comprehensive language selection system with all Indian languages and major international languages, featuring a beautiful multi-select UI component.

## 🌍 Languages Included

### **Indian Languages (25+)**
All official and major regional languages of India:

#### Constitutional Languages
- **Hindi** (हिन्दी) - hi
- **English** - en
- **Bengali** (বাংলা) - bn
- **Telugu** (తెలుగు) - te
- **Marathi** (मराठी) - mr
- **Tamil** (தமிழ்) - ta
- **Urdu** (اردو) - ur
- **Gujarati** (ગુજરાતી) - gu
- **Kannada** (ಕನ್ನಡ) - kn
- **Malayalam** (മലയാളം) - ml
- **Odia** (ଓଡ଼ିଆ) - or
- **Punjabi** (ਪੰਜਾਬੀ) - pa
- **Assamese** (অসমীয়া) - as

#### Regional Languages
- **Maithili** (मैथिली) - mai
- **Magahi** (मगही) - mag
- **Bhojpuri** (भोजपुरी) - bho
- **Sanskrit** (संस्कृतम्) - sa
- **Kashmiri** (कॉशुर) - ks
- **Nepali** (नेपाली) - ne
- **Sindhi** (سنڌي) - sd
- **Konkani** (कोंकणी) - kok
- **Dogri** (डोगरी) - doi
- **Manipuri** (মৈতৈলোন্) - mni
- **Santali** (ᱥᱟᱱᱛᱟᱲᱤ) - sat
- **Bodo** (बड़ो) - brx

### **South Asian Languages**
- **Sinhala** (සිංහල) - si
- **Dhivehi** (ދިވެހި) - dv

### **International Languages (30+)**
- Chinese (Mandarin), Spanish, Arabic, French, German
- Japanese, Portuguese, Russian, Italian, Korean
- Turkish, Polish, Dutch, Vietnamese, Thai
- Indonesian, Malay, Persian, Hebrew, Greek
- Swedish, Norwegian, Danish, Finnish, Czech
- Hungarian, Romanian, Ukrainian
- And more...

## 📁 Files Created

### Constants
- `/src/lib/constants/languages.ts` - Comprehensive language list with:
  - 55+ languages
  - Language codes (ISO 639)
  - Native names
  - Regional grouping
  - Helper functions

### Components
- `/src/components/onboarding/LanguageMultiSelect.tsx` - Multi-select UI component

## 🎨 Features

### **Multi-Select Component**
- ✅ Search functionality
- ✅ Grouped by region (India, South Asia, International)
- ✅ Native language names displayed
- ✅ Selected languages shown as badges
- ✅ Easy removal with X button
- ✅ "Add Popular Indian Languages" quick action
- ✅ Dropdown with checkmarks
- ✅ Responsive design

### **Popular Indian Languages Quick Add**
One-click to add the 10 most commonly spoken Indian languages:
1. English
2. Hindi
3. Bengali
4. Telugu
5. Marathi
6. Tamil
7. Gujarati
8. Kannada
9. Malayalam
10. Punjabi

## 💾 Data Structure

### Storage Format
Languages are stored as **language codes** (ISO 639):
```typescript
{
  practice: {
    languages: ["en", "hi", "ta", "te"] // Array of language codes
  }
}
```

### Display Format
Languages are displayed with their full names:
- English
- Hindi (हिन्दी)
- Tamil (தமிழ்)
- Telugu (తెలుగు)

## 🔧 Usage

### In Onboarding
```tsx
<LanguageMultiSelect
  selectedLanguages={data.therapistProfile.practice.languages}
  onLanguagesChange={(languages) => updateTherapistPractice("languages", languages)}
  label="Languages You Speak"
  placeholder="Search and select languages..."
/>
```

### Helper Functions
```typescript
import { 
  getLanguageName, 
  getLanguageByCode, 
  getLanguagesByCodes,
  POPULAR_INDIAN_LANGUAGES 
} from "@/lib/constants/languages";

// Get language name from code
const name = getLanguageName("hi"); // "Hindi"

// Get language object
const lang = getLanguageByCode("ta"); 
// { code: "ta", name: "Tamil", nativeName: "தமிழ்", region: "India" }

// Get multiple languages
const langs = getLanguagesByCodes(["en", "hi", "ta"]);
```

## 🎯 Integration Points

### Therapist Onboarding
- **Step 4**: Practice Details
- Field: "Languages You Speak"
- Multi-select with search
- Validation: At least 1 language required

### Therapist Profile
Languages are stored in:
```
therapistProfiles/{therapistId}/practice/languages: string[]
```

### Display on Frontend
```tsx
// Convert codes to names for display
const languageNames = therapist.languages.map(code => getLanguageName(code));

// Display
<div>
  {languageNames.map(name => (
    <Badge key={name}>{name}</Badge>
  ))}
</div>
```

## 🔍 Search & Filter

### Search Capabilities
- Search by English name: "Hindi"
- Search by native name: "हिन्दी"
- Case-insensitive
- Instant results

### Grouping
Languages are grouped by region:
1. **India** - All Indian languages first
2. **South Asia** - Neighboring countries
3. **International** - Global languages

## 🌟 UI/UX Features

### Selected Languages Display
- Shown as badges above search
- Each badge has remove button (X)
- Count displayed in dropdown
- Visual feedback on selection

### Dropdown
- Max height with scroll
- Grouped by region
- Region headers with styling
- Checkmark for selected items
- Hover effects
- Click outside to close

### Quick Actions
- "Add Popular Indian Languages" button
- Adds 10 most common Indian languages
- Prevents duplicates

## 📊 Language Statistics

### Total Languages
- **Indian Languages**: 25+
- **South Asian**: 2
- **International**: 30+
- **Total**: 55+

### Most Popular (India)
1. English - Universal
2. Hindi - National language
3. Bengali - 230M+ speakers
4. Telugu - 80M+ speakers
5. Marathi - 80M+ speakers

## 🔄 Migration Notes

### Old Format (Comma-separated strings)
```typescript
languages: ["English", "Hindi", "Tamil"]
```

### New Format (Language codes)
```typescript
languages: ["en", "hi", "ta"]
```

### Migration Function (if needed)
```typescript
function migrateLanguages(oldLanguages: string[]): string[] {
  const mapping: Record<string, string> = {
    "English": "en",
    "Hindi": "hi",
    "Tamil": "ta",
    // ... add more mappings
  };
  
  return oldLanguages.map(lang => mapping[lang] || "en");
}
```

## ✅ Benefits

1. **Comprehensive Coverage** - All Indian languages included
2. **Better UX** - Multi-select instead of comma-separated
3. **Searchable** - Find languages quickly
4. **Standardized** - Uses ISO language codes
5. **Scalable** - Easy to add more languages
6. **Accessible** - Native names for better recognition
7. **Quick Selection** - Popular languages quick-add

## 🚀 Future Enhancements

1. Language proficiency levels (Basic, Intermediate, Fluent)
2. Certification badges for verified language skills
3. Filter therapists by language on search page
4. Auto-detect user's preferred language
5. Multi-language support for the entire platform
6. Voice/video call language matching
7. Translation services integration

## 📝 Testing Checklist

- [ ] Select single language
- [ ] Select multiple languages
- [ ] Search by English name
- [ ] Search by native name
- [ ] Remove selected language
- [ ] Add popular Indian languages
- [ ] Close dropdown by clicking outside
- [ ] Verify language codes are saved
- [ ] Display language names correctly
- [ ] Test with 0 languages (validation)
- [ ] Test with 10+ languages
- [ ] Responsive design on mobile

## 🔗 Related Files

- Language constants: `/src/lib/constants/languages.ts`
- Multi-select component: `/src/components/onboarding/LanguageMultiSelect.tsx`
- Onboarding wizard: `/src/components/onboarding/onboarding-wizard.tsx`
- Therapist model: `/src/types/models/therapist.ts`
