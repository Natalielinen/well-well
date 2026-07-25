import { isAfter, isBefore, isSameDay, parse, startOfDay } from "date-fns";
import { TodoItem } from "../types/todo";

export const isExpired = (todo: TodoItem, now: Date = new Date()): boolean =>
  isBefore(parse(todo.nextDate, "yyyy-MM-dd", new Date()), startOfDay(now));

export const isToday = (todo: TodoItem, selectedDate: Date): boolean =>
  isSameDay(parse(todo.nextDate, "yyyy-MM-dd", new Date()), selectedDate);

export const isFuture = (todo: TodoItem, now: Date = new Date()): boolean =>
  isAfter(parse(todo.nextDate, "yyyy-MM-dd", new Date()), startOfDay(now));

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
