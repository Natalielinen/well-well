import AsyncStorage from "@react-native-async-storage/async-storage";
import { TodoItem } from "../types/todo";

const TODOS_KEY = "TODOS";

export const getTodo = async (id: number): Promise<TodoItem | undefined> =>
  (await loadTodos()).find((todo) => todo.id === id);

export const patchTodo = async (
  id: number,
  partial: Partial<TodoItem>,
  canPatch: (current: TodoItem) => boolean = () => true,
): Promise<TodoItem | undefined> => {
  const todos = await loadTodos();
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1 || !canPatch(todos[index])) return undefined;
  const updated = { ...todos[index], ...partial, id };
  todos[index] = updated;
  await saveTodos(todos);
  return updated;
};

export const saveTodos = async (todos: TodoItem[]) => {
  try {
    await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  } catch (error) {
    throw error;
  }
};

export const loadTodos = async (): Promise<TodoItem[]> => {
  try {
    const data = await AsyncStorage.getItem(TODOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    throw error;
  }
};

// Добавление одной задачи
export const addTodo = async (todo: TodoItem) => {
  const todos = await loadTodos();
  const updated = [todo, ...todos]; // новые наверху
  await saveTodos(updated);
  return updated;
};

// Удалить задачу по id
export const removeTodo = async (id: number) => {
  const todos = await loadTodos();
  const updated = todos.filter((todo) => todo.id !== id);
  await saveTodos(updated);
  return updated;
};

// Обновление задачи по id
export const updateTodo = async (id: number, todo: TodoItem) => {
  const todos = await loadTodos();
  const updated = todos.map((t) => (t.id === id ? todo : t));
  await saveTodos(updated);
  return updated;
};
