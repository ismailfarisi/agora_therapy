/**
 * Timezone Utilities
 * Helper functions for timezone handling and conversion
 */

import { format, parseISO, isValid } from "date-fns";

/**
 * Common timezone mappings
 */
export const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)", offset: "-05:00" },
  { value: "America/Chicago", label: "Central Time (CT)", offset: "-06:00" },
  { value: "America/Denver", label: "Mountain Time (MT)", offset: "-07:00" },
  {
    value: "America/Los_Angeles",
    label: "Pacific Time (PT)",
    offset: "-08:00",
  },
  { value: "Europe/London", label: "London (GMT)", offset: "+00:00" },
  { value: "Europe/Paris", label: "Central European Time", offset: "+01:00" },
  { value: "Europe/Berlin", label: "Central European Time", offset: "+01:00" },
  { value: "Asia/Tokyo", label: "Japan Standard Time", offset: "+09:00" },
  { value: "Asia/Shanghai", label: "China Standard Time", offset: "+08:00" },
  { value: "Asia/Dubai", label: "Gulf Standard Time", offset: "+04:00" },
  { value: "Asia/Kolkata", label: "India Standard Time", offset: "+05:30" },
  {
    value: "Australia/Sydney",
    label: "Australian Eastern Time",
    offset: "+10:00",
  },
  {
    value: "Australia/Melbourne",
    label: "Australian Eastern Time",
    offset: "+10:00",
  },
];

/**
 * Get user's current timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(timezone: string): number {
  const now = new Date();
  const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const targetTime = new Date(
    utc.toLocaleString("en-US", { timeZone: timezone })
  );
  return (targetTime.getTime() - utc.getTime()) / 60000;
}

/**
 * Convert date from one timezone to another
 */
export function convertTimezone(
  date: Date | string,
  fromTimezone: string,
  toTimezone: string
): Date {
  const inputDate = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(inputDate)) {
    throw new Error("Invalid date provided");
  }

  // Convert to string in from timezone, then parse in to timezone
  const utcTime = inputDate.getTime();
  const fromOffset = getTimezoneOffset(fromTimezone) * 60000;
  const toOffset = getTimezoneOffset(toTimezone) * 60000;

  return new Date(utcTime - fromOffset + toOffset);
}

/**
 * Format date in specific timezone
 */
export function formatInTimezone(
  date: Date | string,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const inputDate = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(inputDate)) {
    throw new Error("Invalid date provided");
  }

  // Use toLocaleString with timezone option
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: timezone,
    ...options,
  };

  return inputDate.toLocaleString("en-CA", defaultOptions);
}

/**
 * Get current time in specific timezone
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: timezone }));
}

/**
 * Check if two dates are the same in their respective timezones
 */
export function isSameDateInTimezones(
  date1: Date,
  timezone1: string,
  date2: Date,
  timezone2: string
): boolean {
  const zonedDate1 = new Date(
    date1.toLocaleString("en-US", { timeZone: timezone1 })
  );
  const zonedDate2 = new Date(
    date2.toLocaleString("en-US", { timeZone: timezone2 })
  );

  return (
    zonedDate1.getFullYear() === zonedDate2.getFullYear() &&
    zonedDate1.getMonth() === zonedDate2.getMonth() &&
    zonedDate1.getDate() === zonedDate2.getDate()
  );
}

/**
 * Get business hours for a timezone
 */
export function getBusinessHours(
  timezone: string,
  startHour: number = 9,
  endHour: number = 17
): { start: Date; end: Date } {
  const now = getCurrentTimeInTimezone(timezone);
  const start = new Date(now);
  start.setHours(startHour, 0, 0, 0);

  const end = new Date(now);
  end.setHours(endHour, 0, 0, 0);

  return { start, end };
}

/**
 * Check if current time is within business hours for a timezone
 */
export function isWithinBusinessHours(
  timezone: string,
  startHour: number = 9,
  endHour: number = 17
): boolean {
  const now = getCurrentTimeInTimezone(timezone);
  const currentHour = now.getHours();

  return currentHour >= startHour && currentHour < endHour;
}

/**
 * Get timezone abbreviation
 */
export function getTimezoneAbbreviation(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(now);
  const timeZonePart = parts.find((part) => part.type === "timeZoneName");

  return timeZonePart?.value || timezone.split("/").pop() || timezone;
}

/**
 * Get timezone display name
 */
export function getTimezoneDisplayName(timezone: string): string {
  const commonTz = COMMON_TIMEZONES.find((tz) => tz.value === timezone);
  if (commonTz) {
    return commonTz.label;
  }

  // Generate display name from timezone string
  const parts = timezone.split("/");
  if (parts.length >= 2) {
    const city = parts[parts.length - 1].replace(/_/g, " ");
    const region = parts[0].replace(/_/g, " ");
    return `${city} (${region})`;
  }

  return timezone;
}

/**
 * Convert time string from one timezone to another
 */
export function convertTimeString(
  timeStr: string, // "HH:MM" format
  date: Date,
  fromTimezone: string,
  toTimezone: string
): string {
  const [hours, minutes] = timeStr.split(":").map(Number);

  // Create a date with the specified time in the source timezone
  const sourceDate = new Date(date);
  sourceDate.setHours(hours, minutes, 0, 0);

  // Convert to target timezone
  const convertedDate = convertTimezone(sourceDate, fromTimezone, toTimezone);

  // Return time string in HH:MM format
  return format(convertedDate, "HH:mm");
}

/**
 * Validate timezone string
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get timezone offset string (e.g., "+05:30")
 */
export function getTimezoneOffsetString(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  });

  try {
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((part) => part.type === "timeZoneName");
    return offsetPart?.value || "+00:00";
  } catch {
    // Fallback for browsers that don't support longOffset
    const offset = getTimezoneOffset(timezone);
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? "+" : "-";
    return `${sign}${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }
}

/**
 * Search timezones by name or abbreviation
 */
export function searchTimezones(
  query: string
): Array<{ value: string; label: string }> {
  const lowerQuery = query.toLowerCase();

  return COMMON_TIMEZONES.filter(
    (tz) =>
      tz.value.toLowerCase().includes(lowerQuery) ||
      tz.label.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Time slot utilities for timezone conversion
 */
export interface TimezoneTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  timezone: string;
  localStartTime?: string;
  localEndTime?: string;
  userTimezone?: string;
}

/**
 * Convert time slots to user's timezone
 */
export function convertTimeSlotsToUserTimezone(
  timeSlots: Array<{ id: string; startTime: string; endTime: string }>,
  sourceTimezone: string,
  userTimezone: string,
  date: Date = new Date()
): TimezoneTimeSlot[] {
  return timeSlots.map((slot) => ({
    ...slot,
    timezone: sourceTimezone,
    localStartTime: convertTimeString(
      slot.startTime,
      date,
      sourceTimezone,
      userTimezone
    ),
    localEndTime: convertTimeString(
      slot.endTime,
      date,
      sourceTimezone,
      userTimezone
    ),
    userTimezone,
  }));
}

export default {
  COMMON_TIMEZONES,
  getUserTimezone,
  getTimezoneOffset,
  convertTimezone,
  formatInTimezone,
  getCurrentTimeInTimezone,
  isSameDateInTimezones,
  getBusinessHours,
  isWithinBusinessHours,
  getTimezoneAbbreviation,
  getTimezoneDisplayName,
  convertTimeString,
  isValidTimezone,
  getTimezoneOffsetString,
  searchTimezones,
  convertTimeSlotsToUserTimezone,
};
