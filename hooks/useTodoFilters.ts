import { useMemo } from "react";
import { TodoItem } from "../types/todo";
import { filterDisplayedTodos, isExpired, isFuture } from "../utils/todoFilters";

export function useTodoFilters(
  allTodos: TodoItem[],
  selectedDate: Date,
  showAll: boolean,
) {
  const displayedTodos = useMemo(
    () => filterDisplayedTodos(allTodos, selectedDate, showAll),
    [allTodos, selectedDate, showAll],
  );

  return { displayedTodos, isExpired, isFuture };
}
