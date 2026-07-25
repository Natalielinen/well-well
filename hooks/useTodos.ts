import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { TodoItem } from "../types/todo";
import { loadTodos } from "../storage/todoStorage";

export function useTodos() {
  const [allTodos, setAllTodos] = useState<TodoItem[]>([]);

  const getAllTodos = async () => {
    const storedTodos = await loadTodos();

    setAllTodos(storedTodos);
  };

  // Загружаем все задачи из хранилища при старте
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const storedTodos = await loadTodos();

        if (mounted) {
          setAllTodos(storedTodos);
        }
      } catch (e) {
        if (mounted) {
          Alert.alert("Ошибка", "Не удалось загрузить список задач");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { allTodos, getAllTodos, setAllTodos };
}
