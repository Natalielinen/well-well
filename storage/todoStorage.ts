import AsyncStorage from '@react-native-async-storage/async-storage';
import { TodoItem } from '../types/todo';

const TODOS_KEY = 'TODOS';

export const saveTodos = async (todos: TodoItem[]) => {
  try {
    await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  } catch (error) {
    console.log('Ошибка сохранения', error);
  }
};

export const loadTodos = async (): Promise<TodoItem[]> => {
  try {
    const data = await AsyncStorage.getItem(TODOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log('Ошибка загрузки', error);
    return [];
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
  const updated = todos.filter(todo => todo.id !== id);
  await saveTodos(updated);
  return updated;
};

// Обновление задачи по id
export const updateTodo = async (id: number, todo: TodoItem) => {
  const todos = await loadTodos();
  const updated = todos.map(t => t.id === id ? todo : t);
  await saveTodos(updated);
  return updated;
};