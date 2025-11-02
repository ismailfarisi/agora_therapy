"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeRange {
  start: string;
  end: string;
}

interface DateSpecificHoursModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (dates: Date[], hours: TimeRange[]) => void;
}

export function DateSpecificHoursModal({
  open,
  onClose,
  onApply,
}: DateSpecificHoursModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([
    { start: "09:00", end: "17:00" },
  ]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const toggleDate = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const dateStr = date.toDateString();

    const exists = selectedDates.some((d) => d.toDateString() === dateStr);

    if (exists) {
      setSelectedDates(selectedDates.filter((d) => d.toDateString() !== dateStr));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const isDateSelected = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return selectedDates.some((d) => d.toDateString() === date.toDateString());
  };

  const isToday = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const addTimeRange = () => {
    setTimeRanges([...timeRanges, { start: "09:00", end: "17:00" }]);
  };

  const removeTimeRange = (index: number) => {
    setTimeRanges(timeRanges.filter((_, i) => i !== index));
  };

  const updateTimeRange = (
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    const newRanges = [...timeRanges];
    newRanges[index][field] = value;
    setTimeRanges(newRanges);
  };

  const handleApply = () => {
    onApply(selectedDates, timeRanges);
    onClose();
    // Reset
    setSelectedDates([]);
    setTimeRanges([{ start: "09:00", end: "17:00" }]);
  };

  const handleCancel = () => {
    onClose();
    setSelectedDates([]);
    setTimeRanges([{ start: "09:00", end: "17:00" }]);
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Select the date(s) you want to assign specific hours
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Calendar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{monthName}</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Week days header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const selected = isDateSelected(day);
                const today = isToday(day);

                return (
                  <button
                    key={day}
                    onClick={() => toggleDate(day)}
                    className={cn(
                      "aspect-square rounded-full flex items-center justify-center text-lg font-medium transition-all",
                      selected
                        ? "bg-blue-600 text-white shadow-lg scale-110"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100",
                      today && !selected && "ring-2 ring-blue-600"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {selectedDates.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  {selectedDates.length} date{selectedDates.length !== 1 ? "s" : ""}{" "}
                  selected
                </p>
              </div>
            )}
          </div>

          {/* Time Ranges */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              What hours are you available?
            </h3>
            <div className="space-y-3">
              {timeRanges.map((range, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    type="time"
                    value={range.start}
                    onChange={(e) =>
                      updateTimeRange(index, "start", e.target.value)
                    }
                    className="w-32"
                  />
                  <span className="text-gray-400">-</span>
                  <Input
                    type="time"
                    value={range.end}
                    onChange={(e) =>
                      updateTimeRange(index, "end", e.target.value)
                    }
                    className="w-32"
                  />
                  {timeRanges.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTimeRange(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {index === timeRanges.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addTimeRange}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} size="lg">
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={selectedDates.length === 0}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
