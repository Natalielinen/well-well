import { format, parse } from "date-fns";

export const parseDateKey = (value: string): Date =>
  parse(value, "yyyy-MM-dd", new Date());

export const toDateKey = (date: Date): string => format(date, "yyyy-MM-dd");

export const defaultReminderDate = (taskDate: Date, now: Date = new Date()): Date => {
  const result = new Date(taskDate);
  // В 23:xx следующий целый час — полночь следующего дня.
  result.setHours(now.getHours() + 1, 0, 0, 0);
  return result;
};

export function parseTime(str: string): Date | null {
  const match = str.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
