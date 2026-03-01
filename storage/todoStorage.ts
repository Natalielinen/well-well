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
// const todos: TodoItem[] = [
//   {
//     id: 1,
//     title: "Полить цветы (все) и рыхлить",
//     description: "",
//     lastUpdated: "2026-02-07",
//     isRepeat: true,
//     repeatFrequency: 7,
//     nextDate: "2026-02-24",
//     size: 1,
//     isExpired: false,
//   },
//   {
//     id: 2,
//     title: "Убрать у птиц",
//     description: "",
//     lastUpdated: "2026-02-07",
//     isRepeat: true,
//     repeatFrequency: 7,
//     nextDate: "2026-02-24",
//     size: 1,
//     isExpired: false,
//   },
//   {
//     id: 3,
//     title: "Разобрать на стуле и вдоль стены",
//     description: "",
//     lastUpdated: "2026-01-31",
//     isRepeat: true,
//     repeatFrequency: 14,
//     nextDate: "2026-02-23",
//     size: 3,
//     isExpired: false,
//   },
//   {
//     id: 5,
//     title: "test 2",
//     description: "",
//     lastUpdated: "2026-01-31",
//     isRepeat: true,
//     repeatFrequency: 14,
//     nextDate: "2026-02-23",
//     size: 5,
//     isExpired: false,
//   },
//   {
//     id: 4,
//     title: "test",
//     description: "",
//     lastUpdated: "2026-01-31",
//     isRepeat: true,
//     repeatFrequency: 14,
//     nextDate: "2026-02-25",
//     size: 8,
//     isExpired: true,
//   },
//   {
//     id: 6,
//     title: "test 3",
//     description: "",
//     lastUpdated: "2026-01-31",
//     isRepeat: true,
//     repeatFrequency: 14,
//     nextDate: "2026-02-25",
//     size: 13,
//     isExpired: false,
//   },
// ];