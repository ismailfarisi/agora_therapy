/**
 * Calendar Utilities
 * Helper functions for date manipulation and calendar operations
 */

import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  dayOfWeek: number;
  dayName: string;
  dayNumber: number;
  isHoliday?: boolean;
}

export interface CalendarWeek {
  days: CalendarDay[];
  weekNumber: number;
}

export interface CalendarMonth {
  year: number;
  month: number;
  monthName: string;
  weeks: CalendarWeek[];
  totalDays: number;
}

/**
 * Generate calendar data for a given month and year
 */
export function generateCalendarMonth(
  year: number,
  month: number
): CalendarMonth {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfCalendar = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 }); // Start on Sunday

  const weeks: CalendarWeek[] = [];
  let currentDate = new Date(firstDayOfCalendar);
  let weekNumber = 0;

  // Generate 6 weeks to ensure we cover the full month view
  for (let week = 0; week < 6; week++) {
    const days: CalendarDay[] = [];

    for (let day = 0; day < 7; day++) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = isSameDay(currentDate, new Date());
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      days.push({
        date: new Date(currentDate),
        isCurrentMonth,
        isToday,
        isWeekend,
        dayOfWeek,
        dayName: format(currentDate, "E"),
        dayNumber: currentDate.getDate(),
      });

      currentDate = addDays(currentDate, 1);
    }

    weeks.push({
      days,
      weekNumber: weekNumber++,
    });

    // Stop if we've covered the entire month and then some
    if (currentDate > lastDayOfMonth && week >= 4) {
      break;
    }
  }

  return {
    year,
    month,
    monthName: format(firstDayOfMonth, "MMMM yyyy"),
    weeks,
    totalDays: lastDayOfMonth.getDate(),
  };
}

/**
 * Get day names for calendar header
 */
export function getDayNames(nameFormat: "short" | "long" = "short"): string[] {
  const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
  const dayNames: string[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(startDate, i);
    const formatStr = nameFormat === "short" ? "E" : "EEEE";
    dayNames.push(format(date, formatStr));
  }

  return dayNames;
}

/**
 * Get month names
 */
export function getMonthNames(nameFormat: "short" | "long" = "long"): string[] {
  const monthNames: string[] = [];
  const formatStr = nameFormat === "short" ? "MMM" : "MMMM";

  for (let i = 0; i < 12; i++) {
    const date = new Date(2024, i, 1); // Use any year
    monthNames.push(format(date, formatStr));
  }

  return monthNames;
}

/**
 * Check if a date falls within a date range
 */
export function isDateInRange(
  date: Date,
  startDate: Date,
  endDate: Date
): boolean {
  const checkDate = startOfDay(date);
  const rangeStart = startOfDay(startDate);
  const rangeEnd = endOfDay(endDate);

  return checkDate >= rangeStart && checkDate <= rangeEnd;
}

/**
 * Get the number of days between two dates
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Generate date range
 */
export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is a weekday
 */
export function isWeekday(date: Date): boolean {
  return !isWeekend(date);
}

/**
 * Get the week dates (Sunday to Saturday) for a given date
 */
export function getWeekDates(date: Date): Date[] {
  const startOfCurrentWeek = startOfWeek(date, { weekStartsOn: 0 });
  const weekDates: Date[] = [];

  for (let i = 0; i < 7; i++) {
    weekDates.push(addDays(startOfCurrentWeek, i));
  }

  return weekDates;
}

/**
 * Format date for display
 */
export function formatDateForDisplay(
  date: Date,
  formatStr: string = "MMM d, yyyy"
): string {
  return format(date, formatStr);
}

/**
 * Format time for display
 */
export function formatTimeForDisplay(
  date: Date,
  format24Hour: boolean = false
): string {
  return format(date, format24Hour ? "HH:mm" : "h:mm a");
}

/**
 * Parse time string to minutes since midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Format minutes to time string
 */
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Add minutes to a time string
 */
export function addMinutesToTime(
  timeStr: string,
  minutesToAdd: number
): string {
  const totalMinutes = parseTimeToMinutes(timeStr) + minutesToAdd;
  return formatMinutesToTime(totalMinutes);
}

/**
 * Check if one time slot overlaps with another
 */
export function timeOverlaps(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Minutes = parseTimeToMinutes(start1);
  const end1Minutes = parseTimeToMinutes(end1);
  const start2Minutes = parseTimeToMinutes(start2);
  const end2Minutes = parseTimeToMinutes(end2);

  return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
}

/**
 * Get business days between two dates (excluding weekends)
 */
export function getBusinessDaysBetween(startDate: Date, endDate: Date): Date[] {
  const dates = generateDateRange(startDate, endDate);
  return dates.filter(isWeekday);
}

/**
 * Add business days to a date
 */
export function addBusinessDays(date: Date, days: number): Date {
  let currentDate = new Date(date);
  let remainingDays = days;

  while (remainingDays > 0) {
    currentDate = addDays(currentDate, 1);
    if (isWeekday(currentDate)) {
      remainingDays--;
    }
  }

  return currentDate;
}

/**
 * Get the next occurrence of a specific day of the week
 */
export function getNextDayOfWeek(from: Date, dayOfWeek: number): Date {
  const currentDay = from.getDay();
  const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7 || 7;
  return addDays(from, daysUntilTarget);
}

/**
 * Common holidays (US-based, can be customized)
 */
export const COMMON_HOLIDAYS = [
  { month: 0, day: 1, name: "New Year's Day" },
  { month: 6, day: 4, name: "Independence Day" },
  { month: 11, day: 25, name: "Christmas Day" },
  // Add more holidays as needed
];

/**
 * Check if a date is a common holiday
 */
export function isHoliday(date: Date): boolean {
  return COMMON_HOLIDAYS.some(
    (holiday) =>
      date.getMonth() === holiday.month && date.getDate() === holiday.day
  );
}

/**
 * Get holiday name if the date is a holiday
 */
export function getHolidayName(date: Date): string | null {
  const holiday = COMMON_HOLIDAYS.find(
    (h) => date.getMonth() === h.month && date.getDate() === h.day
  );
  return holiday?.name || null;
}

/**
 * Calendar view types
 */
export type CalendarView = "month" | "week" | "day";

/**
 * Get calendar navigation dates based on current date and view
 */
export function getCalendarNavigation(currentDate: Date, view: CalendarView) {
  const today = new Date();

  switch (view) {
    case "month":
      return {
        previous: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        ),
        next: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1
        ),
        today: new Date(today.getFullYear(), today.getMonth(), 1),
        title: format(currentDate, "MMMM yyyy"),
      };

    case "week":
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      return {
        previous: addDays(weekStart, -7),
        next: addDays(weekStart, 7),
        today: startOfWeek(today, { weekStartsOn: 0 }),
        title: `${format(weekStart, "MMM d")} - ${format(
          addDays(weekStart, 6),
          "MMM d, yyyy"
        )}`,
      };

    case "day":
      return {
        previous: addDays(currentDate, -1),
        next: addDays(currentDate, 1),
        today: startOfDay(today),
        title: format(currentDate, "EEEE, MMMM d, yyyy"),
      };

    default:
      throw new Error(`Unsupported calendar view: ${view}`);
  }
}

/**
 * Time slot utilities for calendar display
 */
export interface TimeSlotDisplay {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  displayName: string;
  isAvailable: boolean;
  isBooked?: boolean;
  isOverride?: boolean;
}

/**
 * Generate time slots for a day view
 */
export function generateDayTimeSlots(
  startHour: number = 8,
  endHour: number = 18,
  intervalMinutes: number = 30
): Array<{ time: string; displayTime: string }> {
  const slots: Array<{ time: string; displayTime: string }> = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeStr = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const displayTime = format(new Date(2024, 0, 1, hour, minute), "h:mm a");
      slots.push({ time: timeStr, displayTime });
    }
  }

  return slots;
}

export default {
  generateCalendarMonth,
  getDayNames,
  getMonthNames,
  isDateInRange,
  getDaysBetween,
  generateDateRange,
  isWeekend,
  isWeekday,
  getWeekDates,
  formatDateForDisplay,
  formatTimeForDisplay,
  parseTimeToMinutes,
  formatMinutesToTime,
  addMinutesToTime,
  timeOverlaps,
  getBusinessDaysBetween,
  addBusinessDays,
  getNextDayOfWeek,
  isHoliday,
  getHolidayName,
  getCalendarNavigation,
  generateDayTimeSlots,
};
