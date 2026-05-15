import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Text,
  FlatList,
  Pressable,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Todo from "./components/Todo/Todo";
import { TodoItem } from "./types/todo";
import { styles } from "./styles";
import AddTodo from "./components/AddTodo/AddTodo";
import {
  format,
  isAfter,
  isBefore,
  isSameDay,
  parse,
  startOfDay,
} from "date-fns";
import { addTodo, loadTodos, updateTodo } from "./storage/todoStorage";
import { StatusBar } from "expo-status-bar";
import { MobileAds, BannerAdSize, BannerView } from "yandex-mobile-ads";
import { colors } from "./themes/colors";
import Header from "./components/Header/Header";
import WeekStrip from "./components/WeekStrip/WeekStrip";
import { Plus } from "lucide-react-native";
import EmptyState from "./components/EmptyState/EmptyState";

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [showAddModal, setShowAddModal] = useState(false);
  const [today, setToday] = useState(format(new Date(), "dd.MM.yyyy")); // формат для отображения в UI

  const [allTodos, setAllTodos] = useState<TodoItem[]>([]);

  const [showAll, setShowAll] = useState(false);

  const [editData, setEditData] = useState<TodoItem | null>(null);

  const { width } = Dimensions.get("window");

  const [bannerSize, setBannerSize] = useState<BannerAdSize | null>(null);

  useEffect(() => {
    BannerAdSize.stickySize(width).then(setBannerSize);
  }, []);

  // Date navigation
  const changeDate = useCallback((days: number) => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
    setShowAll(false);
  }, []);

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setShowAll(false);
  }, []);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      // Configure the user privacy data policy before init sdk
      await MobileAds.initialize();
    })();
  });

  const isExpired = (todo: TodoItem) =>
    isBefore(
      parse(todo.nextDate, "yyyy-MM-dd", new Date()),
      startOfDay(new Date()),
    );

  const isToday = (todo: TodoItem) =>
    isSameDay(parse(todo.nextDate, "yyyy-MM-dd", new Date()), selectedDate);

  const isFuture = (todo: TodoItem) =>
    isAfter(
      parse(todo.nextDate, "yyyy-MM-dd", new Date()),
      startOfDay(new Date()),
    );

  const sortByDate = (todos: TodoItem[]) =>
    [...todos].sort((a, b) => a.nextDate.localeCompare(b.nextDate));

  const displayedTodos = useMemo(() => {
    if (showAll) {
      const expired = sortByDate(allTodos.filter(isExpired));
      const rest = sortByDate(allTodos.filter((todo) => !isExpired(todo)));

      return [...expired, ...rest];
    }

    const expired = sortByDate(allTodos.filter(isExpired));
    const today = sortByDate(allTodos.filter(isToday));

    return [...expired, ...today];
  }, [allTodos, selectedDate, showAll]);

  const getAllTodos = async () => {
    const storedTodos = await loadTodos();

    setAllTodos(storedTodos);
  };

  // Загружаем все задачи из хранилища при старте
  useEffect(() => {
    setToday(format(new Date(), "dd.MM.yyyy"));

    getAllTodos();
    setShowAll(false);
  }, []);

  useEffect(() => {
    setToday(format(selectedDate, "dd.MM.yyyy"));
  }, [selectedDate]);

  const onModalClose = () => setShowAddModal(false);

  const disabledPreviousDates = isBefore(
    parse(today, "dd.MM.yyyy", new Date()),
    new Date(),
  );

  const onAddTodo = async (newTask: TodoItem) => {
    await addTodo(newTask);

    setAllTodos((prev) => [newTask, ...prev]);
  };

  const onUpdateTodo = async (id: number, updatedTodo: TodoItem) => {
    await updateTodo(id, updatedTodo);

    getAllTodos();
  };

  const onFilterChange = () => {
    setShowAll((prev) => !prev);
    setSelectedDate(new Date());
  };

  const openEditModal = (editData: TodoItem) => {
    setEditData(editData);
    setShowAddModal(true);
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.primary} />

      <Header
        currentDate={selectedDate}
        onPrevDate={() => changeDate(-1)}
        onNextDate={() => changeDate(1)}
        onShowAll={onFilterChange}
        disabledPreviousDates={disabledPreviousDates}
      />

      {!showAll && (
        <WeekStrip
          selectedDate={selectedDate}
          onSelectDate={selectDate}
          tasks={allTodos}
        />
      )}

      <FlatList
        ref={flatListRef}
        contentContainerStyle={styles.appScrollableContainer}
        data={displayedTodos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Todo
            todo={item}
            isTodoExpired={isExpired(item)}
            isFuture={isFuture(item)}
            getAllTodos={getAllTodos}
            openEditModal={() => openEditModal(item)}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        ListFooterComponent={
          displayedTodos.length > 10 ? (
            <Pressable style={styles.backToTopButton} onPress={scrollToTop}>
              <Text style={styles.backToTopButtonText}>К началу списка ↑</Text>
            </Pressable>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Plus color="white" size={24} strokeWidth={2.5} />
      </TouchableOpacity>

      <AddTodo
        showModal={showAddModal}
        closeModal={onModalClose}
        onAddTodo={onAddTodo}
        onUpdateTodo={onUpdateTodo}
        editData={editData}
        setEditData={setEditData}
        currentDate={selectedDate}
      />

      {bannerSize && (
        <BannerView
          size={bannerSize}
          adRequest={{
            adUnitId: "R-M-19204363-1",
          }}
          style={{ width: "100%", height: 100 }}
          onAdLoaded={() => console.log("loaded")}
          onAdFailedToLoad={(e) => console.log("error", e.nativeEvent)}
        />
      )}
    </GestureHandlerRootView>
  );
}
