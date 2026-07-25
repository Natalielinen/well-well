import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Text,
  FlatList,
  Pressable,
  Dimensions,
} from "react-native";
import Todo from "./components/Todo/Todo";
import { TodoItem } from "./types/todo";
import { styles } from "./styles";
import AddTodo from "./components/AddTodo/AddTodo";
import { format, isBefore, parse } from "date-fns";
import { StatusBar } from "expo-status-bar";
import { MobileAds, BannerAdSize, BannerView } from "yandex-mobile-ads";
import { colors } from "./themes/colors";
import Header from "./components/Header/Header";
import WeekStrip from "./components/WeekStrip/WeekStrip";
import EmptyState from "./components/EmptyState/EmptyState";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTodoFilters } from "./hooks/useTodoFilters";
import { useTodos } from "./hooks/useTodos";

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [today, setToday] = useState(format(new Date(), "dd.MM.yyyy")); // формат для отображения в UI
  const { allTodos, getAllTodos, onAddTodo, onUpdateTodo } = useTodos();
  const [showAll, setShowAll] = useState(false);
  const [editData, setEditData] = useState<TodoItem | null>(null);
  const [bannerSize, setBannerSize] = useState<BannerAdSize | null>(null);
  const [prevDateLoading, setPrevDateLoading] = useState(false);

  const { width } = Dimensions.get("window");

  useEffect(() => {
    let mounted = true;

    BannerAdSize.stickySize(width)
      .then((size) => {
        if (mounted) {
          setBannerSize(size);
        }
      })
      .catch((e) => {
        console.log("Не удалось получить размер рекламного баннера", e);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Date navigation
  const changeDate = useCallback((days: number) => {
    setPrevDateLoading(true);
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
    setShowAll(false);

    setTimeout(() => {
      setPrevDateLoading(false);
    }, 500);
  }, []);

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setShowAll(false);
  }, []);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      try {
        // Configure the user privacy data policy before init sdk
        await MobileAds.initialize();
      } catch (e) {
        console.log("Не удалось инициализировать MobileAds", e);
      }
    })();
    // Пустой массив зависимостей: инициализация SDK должна выполняться один раз при монтировании, а не на каждый рендер
  }, []);

  const { displayedTodos, isExpired, isFuture } = useTodoFilters(
    allTodos,
    selectedDate,
    showAll,
  );

  // Загрузка allTodos при старте инкапсулирована в useTodos (см. hooks/useTodos.ts)
  // Синхронный эффект (только setState), async-операций и подписок нет — cleanup не требуется
  useEffect(() => {
    setToday(format(new Date(), "dd.MM.yyyy"));

    setShowAll(false);
  }, []);

  // Синхронный эффект (только setState) — cleanup не требуется
  useEffect(() => {
    setToday(format(selectedDate, "dd.MM.yyyy"));
  }, [selectedDate]);

  const onModalClose = () => setShowAddModal(false);

  const disabledPreviousDates = isBefore(
    parse(today, "dd.MM.yyyy", new Date()),
    new Date(),
  );

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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={colors.primary} />

      <Header
        currentDate={selectedDate}
        onPrevDate={() => changeDate(-1)}
        onNextDate={() => changeDate(1)}
        onShowAll={onFilterChange}
        onAddTodo={() => setShowAddModal(true)}
        disabledPreviousDates={disabledPreviousDates}
        prevDateLoading={prevDateLoading}
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
    </SafeAreaView>
  );
}
