/**
 * Comprehensive Timezone List
 * Includes all major timezones with special focus on India and Asia
 */

export const TIMEZONES = [
  // UTC
  { value: "UTC", label: "UTC (Coordinated Universal Time)", region: "UTC" },

  // North America
  { value: "America/New_York", label: "Eastern Time (New York)", region: "North America" },
  { value: "America/Chicago", label: "Central Time (Chicago)", region: "North America" },
  { value: "America/Denver", label: "Mountain Time (Denver)", region: "North America" },
  { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)", region: "North America" },
  { value: "America/Phoenix", label: "Arizona Time (Phoenix)", region: "North America" },
  { value: "America/Anchorage", label: "Alaska Time (Anchorage)", region: "North America" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (Honolulu)", region: "North America" },
  { value: "America/Toronto", label: "Eastern Time (Toronto)", region: "North America" },
  { value: "America/Vancouver", label: "Pacific Time (Vancouver)", region: "North America" },

  // Europe
  { value: "Europe/London", label: "London (GMT/BST)", region: "Europe" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)", region: "Europe" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)", region: "Europe" },
  { value: "Europe/Rome", label: "Rome (CET/CEST)", region: "Europe" },
  { value: "Europe/Madrid", label: "Madrid (CET/CEST)", region: "Europe" },
  { value: "Europe/Amsterdam", label: "Amsterdam (CET/CEST)", region: "Europe" },
  { value: "Europe/Brussels", label: "Brussels (CET/CEST)", region: "Europe" },
  { value: "Europe/Vienna", label: "Vienna (CET/CEST)", region: "Europe" },
  { value: "Europe/Zurich", label: "Zurich (CET/CEST)", region: "Europe" },
  { value: "Europe/Stockholm", label: "Stockholm (CET/CEST)", region: "Europe" },
  { value: "Europe/Moscow", label: "Moscow (MSK)", region: "Europe" },
  { value: "Europe/Istanbul", label: "Istanbul (TRT)", region: "Europe" },

  // Asia - India (IST - Indian Standard Time)
  { value: "Asia/Kolkata", label: "India - Kolkata (IST)", region: "Asia - India" },
  { value: "Asia/Mumbai", label: "India - Mumbai (IST)", region: "Asia - India" },
  { value: "Asia/Delhi", label: "India - Delhi (IST)", region: "Asia - India" },
  { value: "Asia/Bangalore", label: "India - Bangalore (IST)", region: "Asia - India" },
  { value: "Asia/Chennai", label: "India - Chennai (IST)", region: "Asia - India" },
  { value: "Asia/Hyderabad", label: "India - Hyderabad (IST)", region: "Asia - India" },
  { value: "Asia/Pune", label: "India - Pune (IST)", region: "Asia - India" },
  { value: "Asia/Ahmedabad", label: "India - Ahmedabad (IST)", region: "Asia - India" },

  // Asia - Middle East
  { value: "Asia/Dubai", label: "Dubai (GST)", region: "Asia - Middle East" },
  { value: "Asia/Abu_Dhabi", label: "Abu Dhabi (GST)", region: "Asia - Middle East" },
  { value: "Asia/Riyadh", label: "Riyadh (AST)", region: "Asia - Middle East" },
  { value: "Asia/Kuwait", label: "Kuwait (AST)", region: "Asia - Middle East" },
  { value: "Asia/Doha", label: "Doha (AST)", region: "Asia - Middle East" },
  { value: "Asia/Bahrain", label: "Bahrain (AST)", region: "Asia - Middle East" },
  { value: "Asia/Muscat", label: "Muscat (GST)", region: "Asia - Middle East" },
  { value: "Asia/Jerusalem", label: "Jerusalem (IST)", region: "Asia - Middle East" },
  { value: "Asia/Beirut", label: "Beirut (EET)", region: "Asia - Middle East" },

  // Asia - East & Southeast
  { value: "Asia/Singapore", label: "Singapore (SGT)", region: "Asia - Southeast" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)", region: "Asia - East" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)", region: "Asia - East" },
  { value: "Asia/Beijing", label: "Beijing (CST)", region: "Asia - East" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", region: "Asia - East" },
  { value: "Asia/Seoul", label: "Seoul (KST)", region: "Asia - East" },
  { value: "Asia/Taipei", label: "Taipei (CST)", region: "Asia - East" },
  { value: "Asia/Bangkok", label: "Bangkok (ICT)", region: "Asia - Southeast" },
  { value: "Asia/Jakarta", label: "Jakarta (WIB)", region: "Asia - Southeast" },
  { value: "Asia/Manila", label: "Manila (PHT)", region: "Asia - Southeast" },
  { value: "Asia/Kuala_Lumpur", label: "Kuala Lumpur (MYT)", region: "Asia - Southeast" },
  { value: "Asia/Ho_Chi_Minh", label: "Ho Chi Minh (ICT)", region: "Asia - Southeast" },

  // Asia - South & Central
  { value: "Asia/Karachi", label: "Karachi (PKT)", region: "Asia - South" },
  { value: "Asia/Dhaka", label: "Dhaka (BST)", region: "Asia - South" },
  { value: "Asia/Colombo", label: "Colombo (IST)", region: "Asia - South" },
  { value: "Asia/Kathmandu", label: "Kathmandu (NPT)", region: "Asia - South" },
  { value: "Asia/Kabul", label: "Kabul (AFT)", region: "Asia - Central" },
  { value: "Asia/Tashkent", label: "Tashkent (UZT)", region: "Asia - Central" },
  { value: "Asia/Almaty", label: "Almaty (ALMT)", region: "Asia - Central" },

  // Australia & Pacific
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)", region: "Australia" },
  { value: "Australia/Melbourne", label: "Melbourne (AEDT/AEST)", region: "Australia" },
  { value: "Australia/Brisbane", label: "Brisbane (AEST)", region: "Australia" },
  { value: "Australia/Perth", label: "Perth (AWST)", region: "Australia" },
  { value: "Australia/Adelaide", label: "Adelaide (ACDT/ACST)", region: "Australia" },
  { value: "Pacific/Auckland", label: "Auckland (NZDT/NZST)", region: "Pacific" },
  { value: "Pacific/Fiji", label: "Fiji (FJT)", region: "Pacific" },

  // South America
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)", region: "South America" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (ART)", region: "South America" },
  { value: "America/Santiago", label: "Santiago (CLT)", region: "South America" },
  { value: "America/Lima", label: "Lima (PET)", region: "South America" },
  { value: "America/Bogota", label: "Bogotá (COT)", region: "South America" },
  { value: "America/Caracas", label: "Caracas (VET)", region: "South America" },

  // Africa
  { value: "Africa/Cairo", label: "Cairo (EET)", region: "Africa" },
  { value: "Africa/Johannesburg", label: "Johannesburg (SAST)", region: "Africa" },
  { value: "Africa/Lagos", label: "Lagos (WAT)", region: "Africa" },
  { value: "Africa/Nairobi", label: "Nairobi (EAT)", region: "Africa" },
  { value: "Africa/Casablanca", label: "Casablanca (WET)", region: "Africa" },
];

// Group timezones by region for easier selection
export const TIMEZONE_GROUPS = TIMEZONES.reduce((acc, tz) => {
  if (!acc[tz.region]) {
    acc[tz.region] = [];
  }
  acc[tz.region].push(tz);
  return acc;
}, {} as Record<string, typeof TIMEZONES>);

// Get timezone label by value
export function getTimezoneLabel(value: string): string {
  const tz = TIMEZONES.find((t) => t.value === value);
  return tz?.label || value;
}

// Get user's current timezone
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}
