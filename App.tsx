import { useEffect, useState } from "react";
import { View, Text, Button, Modal, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Todo from "./components/Todo/Todo";
import { TodoItem } from "./types/todo";
import { styles } from "./styles";
import CustomButton from "./ui/CustomButton/CustomButton";
import AddTodo from "./components/AddTodo/AddTodo";
import { addDays, format, isSameDay, parse, subDays } from "date-fns";
import { addTodo, loadTodos, removeTodo } from "./storage/todoStorage";

export default function App() {
  const [exitModalVusible, setExitModalVisible] = useState(false);
  const [showExtraId, setShowExtraId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [today, setToday] = useState(format(new Date(), "dd.MM.yyyy")); // формат для отображения в UI
  //  const [data, setData] = useState<TodoItem[]>([]);
  const [showAll, setShowAll] = useState(false);

  const [allTodos, setAllTodos] = useState<TodoItem[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<TodoItem[]>([]);

  const filterTodosByDate = (todos: TodoItem[]) => {
    return todos.filter((todo) => {
      const todoDate = parse(todo.nextDate, "yyyy-MM-dd", new Date());
      return isSameDay(todoDate, new Date());
    })
  }

  // Загружаем все задачи из хранилища при старте
  useEffect(() => {
    const init = async () => {
      const storedTodos = await loadTodos();
      setAllTodos(storedTodos);
      // фильтруем по сегодняшней дате
      setFilteredTodos(filterTodosByDate(storedTodos));
    };

    init();
    setShowAll(false);
  }, []);

  const onModalClose = () => setShowAddModal(false);

  const onDateChange = (type: "prev" | "next") => {
    setShowAll(false);
    setToday((prev) => {
      const parsedDate = parse(prev, "dd.MM.yyyy", new Date());
      const newDate =
        type === "prev" ? subDays(parsedDate, 1) : addDays(parsedDate, 1);
      setFilteredTodos(
        allTodos.filter((todo) =>
          isSameDay(parse(todo.nextDate, "yyyy-MM-dd", new Date()), newDate),
        ),
      );
      return format(newDate, "dd.MM.yyyy");
    });
  };

  const onAddTodo = (newTask: TodoItem) => {
    addTodo(newTask);
    const updatedTodos = [newTask, ...allTodos];
    setAllTodos(updatedTodos);

    // фильтруем по сегодняшней дате
    setFilteredTodos(filterTodosByDate(updatedTodos));
  };


  const onFilterChange = () => {
    setShowAll(!showAll);
    if (showAll) {
      setFilteredTodos(allTodos);
    } else {
      setFilteredTodos(filteredTodos); // ??
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.appContainer}>
        <View style={styles.appHeader}>
          <CustomButton
            onClick={onFilterChange}
            text={!showAll ? "Показать все" : " За сегодня"}
            variant={showAll ? "outlinePrimary" : "primary"}
          />
          <CustomButton
            onClick={() => setShowAddModal(true)}
            text="+"
            variant="secondary"
          />
        </View>
        <View style={styles.date}>
          <CustomButton
            onClick={() => onDateChange("prev")}
            text="<"
            variant="ghost"
          />
          <Text style={styles.dateText}> {today} </Text>
          <CustomButton
            onClick={() => onDateChange("next")}
            text=">"
            variant="ghost"
          />
        </View>

        <FlatList
          contentContainerStyle={styles.appScrollableContainer}
          data={filteredTodos}
          renderItem={({ item }) => {
            return (
              <Todo
                setShowExtraId={setShowExtraId}
                showExtraId={showExtraId}
                todo={item}
              />
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>На сегодня задач нет</Text>
          } // TODO: добавить кастомный компонент
          ListFooterComponent={
            filteredTodos.length > 10 ? (
              <Pressable style={styles.backToTopButton}>
                <Text style={styles.backToTopButtonText}>
                  К началу списка ↑
                </Text>
              </Pressable>
            ) : null
          }
        />

        <Modal
          visible={exitModalVusible}
          onRequestClose={() => setExitModalVisible(false)}
          animationType="fade"
        >
          <View>
            <Text>Are you sure you want to exit?</Text>
          </View>
          <View>
            <Button title="close" onPress={() => setExitModalVisible(false)} />
          </View>
        </Modal>

        <AddTodo showModal={showAddModal} closeModal={onModalClose} onAddTodo={onAddTodo} />
      </View>
    </SafeAreaView>
  );
}
