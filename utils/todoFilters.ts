import { isAfter, isBefore, isSameDay, startOfDay } from "date-fns";
import { TodoItem } from "../types/todo";
import { parseDateKey } from "./time";

export const isExpired = (todo: TodoItem, now: Date = new Date()): boolean =>
  isBefore(parseDateKey(todo.nextDate), startOfDay(now));

export const isToday = (todo: TodoItem, selectedDate: Date): boolean =>
  isSameDay(parseDateKey(todo.nextDate), selectedDate);

export const isFuture = (todo: TodoItem, now: Date = new Date()): boolean =>
  isAfter(parseDateKey(todo.nextDate), startOfDay(now));

export const sortByDate = (todos: TodoItem[]): TodoItem[] =>
  [...todos].sort((a, b) => a.nextDate.localeCompare(b.nextDate));

export const filterDisplayedTodos = (
  todos: TodoItem[],
  selectedDate: Date,
  showAll: boolean,
  now: Date = new Date(),
): TodoItem[] => {
  if (showAll) {
    const expired = sortByDate(todos.filter((todo) => isExpired(todo, now)));
    const rest = sortByDate(todos.filter((todo) => !isExpired(todo, now)));

    return [...expired, ...rest];
  }

  const expired = sortByDate(todos.filter((todo) => isExpired(todo, now)));
  const today = sortByDate(
    todos.filter((todo) => isToday(todo, selectedDate)),
  );

  return [...expired, ...today];
};
