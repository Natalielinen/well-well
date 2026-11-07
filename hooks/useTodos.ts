import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { TodoItem } from "../types/todo";
import { addTodo, loadTodos, updateTodo } from "../storage/todoStorage";
import { notifyReminderFailed, useNotifications } from "./useNotifications";

export function useTodos() {
  const [allTodos, setAllTodos] = useState<TodoItem[]>([]);

  const { scheduleNotification, cancelNotification } = useNotifications();

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

  const onAddTodo = async (newTask: TodoItem) => {
    const taskToSave = { ...newTask, notificationId: undefined as string | undefined };
    let reminderFailed = false;

    if (newTask.reminderDate) {
      const reminderDate = new Date(newTask.reminderDate);

      try {
        const { notificationId } = await scheduleNotification(
          newTask.title,
          newTask.description || "Напоминание о задаче",
          reminderDate,
        );
        taskToSave.notificationId = notificationId;
      } catch (e) {
        taskToSave.reminderDate = undefined;
        taskToSave.notificationId = undefined;
        reminderFailed = true;
      }
    }

    await addTodo(taskToSave);
    setAllTodos((prev) => [taskToSave, ...prev]);
    if (reminderFailed) await notifyReminderFailed();
  };

  const onUpdateTodo = async (id: number, updatedTodo: TodoItem) => {
    const oldTodo = allTodos.find((t) => t.id === id);

    if (oldTodo?.notificationId) {
      await cancelNotification(oldTodo.notificationId);
    }

    let taskToSave: TodoItem = { ...updatedTodo, notificationId: undefined };
    let reminderFailed = false;

    if (updatedTodo.reminderDate) {
      try {
        const { notificationId } = await scheduleNotification(
          updatedTodo.title,
          updatedTodo.description || "Напоминание о задаче",
          new Date(updatedTodo.reminderDate),
        );

        if (notificationId) {
          taskToSave.notificationId = notificationId;
        }
      } catch (e) {
        taskToSave.reminderDate = undefined;
        taskToSave.notificationId = undefined;
        reminderFailed = true;
      }
    }

    await updateTodo(id, taskToSave);
    await getAllTodos();
    if (reminderFailed) await notifyReminderFailed();
  };

  return { allTodos, getAllTodos, onAddTodo, onUpdateTodo };
}
