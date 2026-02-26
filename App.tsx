import { useEffect, useState } from "react";
import { View, Text, Button, Modal, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Todo from "./components/Todo/Todo";
import { TodoItem } from "./types/todo";
import { styles } from "./styles";
import CustomButton from "./ui/CustomButton/CustomButton";
import AddTodo from "./components/AddTodo/AddTodo";
import { addDays, format, isSameDay, parse, subDays } from "date-fns";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const todos: TodoItem[] = [
  {
    id: 1,
    title: "Полить цветы (все) и рыхлить",
    description: "",
    lastUpdated: "2026-02-07",
    isRepeat: true,
    repeatFrequency: 7,
    nextDate: "2026-02-24",
    size: 1,
    isExpired: false,
  },
  {
    id: 2,
    title: "Убрать у птиц",
    description: "",
    lastUpdated: "2026-02-07",
    isRepeat: true,
    repeatFrequency: 7,
    nextDate: "2026-02-24",
    size: 1,
    isExpired: false,
  },
  {
    id: 3,
    title: "Разобрать на стуле и вдоль стены",
    description: "",
    lastUpdated: "2026-01-31",
    isRepeat: true,
    repeatFrequency: 14,
    nextDate: "2026-02-23",
    size: 3,
    isExpired: false,
  },
  {
    id: 5,
    title: "test 2",
    description: "",
    lastUpdated: "2026-01-31",
    isRepeat: true,
    repeatFrequency: 14,
    nextDate: "2026-02-23",
    size: 5,
    isExpired: false,
  },
  {
    id: 4,
    title: "test",
    description: "",
    lastUpdated: "2026-01-31",
    isRepeat: true,
    repeatFrequency: 14,
    nextDate: "2026-02-25",
    size: 8,
    isExpired: true,
  },
  {
    id: 6,
    title: "test 3",
    description: "",
    lastUpdated: "2026-01-31",
    isRepeat: true,
    repeatFrequency: 14,
    nextDate: "2026-02-25",
    size: 13,
    isExpired: false,
  },
];

export default function App() {
  const [exitModalVusible, setExitModalVisible] = useState(false);
  const [showExtraId, setShowExtraId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [today, setToday] = useState(format(new Date(), "dd.MM.yyyy")); // формат для отображения в UI
  const [data, setData] = useState<TodoItem[]>([]);
  const [showAll, setShowAll] = useState(false);

  const todayData = todos.filter((todo) => {
    const todoDate = parse(todo.nextDate, "yyyy-MM-dd", new Date());
    return isSameDay(todoDate, new Date());
  });

  useEffect(() => {
    setData(todayData);
  }, []);

  const onModalClose = () => setShowAddModal(false);

  const onDateChange = (type: "prev" | "next") => {
    setShowAll(false);
    setToday((prev) => {
      const parsedDate = parse(prev, "dd.MM.yyyy", new Date());
      const newDate =
        type === "prev" ? subDays(parsedDate, 1) : addDays(parsedDate, 1);
      setData(
        todos.filter((todo) =>
          isSameDay(parse(todo.nextDate, "yyyy-MM-dd", new Date()), newDate),
        ),
      );
      return format(newDate, "dd.MM.yyyy");
    });
  };

  const onFilterChange = () => {
    setShowAll(!showAll);
    if (showAll) {
      setData(todayData);
    } else {
      setData(todos);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.appContainer}>
        <View style={styles.appHeader}>
          <CustomButton
            onClick={onFilterChange}
            text={
              <MaterialCommunityIcons name="filter" size={24} color="black" />
            }
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
          <Text style={styles.dateText}> Сегодня: {today} </Text>
          <CustomButton
            onClick={() => onDateChange("next")}
            text=">"
            variant="ghost"
          />
        </View>

        <FlatList
          contentContainerStyle={styles.appScrollableContainer}
          data={data}
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
            data.length > 10 ? (
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

        <AddTodo showModal={showAddModal} closeModal={onModalClose} />
      </View>
    </SafeAreaView>
  );
}
