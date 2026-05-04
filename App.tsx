import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Button, Modal, FlatList, Pressable, Platform, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Todo from "./components/Todo/Todo";
import { TodoItem } from "./types/todo";
import { styles } from "./styles";
import CustomButton from "./ui/CustomButton/CustomButton";
import AddTodo from "./components/AddTodo/AddTodo";
import {
  addDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parse,
  startOfDay,
  subDays,
} from "date-fns";
import { addTodo, loadTodos, updateTodo } from "./storage/todoStorage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { StatusBar } from "expo-status-bar";
import {
  MobileAds, AdTheme, BannerAdSize, BannerView, Gender, Location
} from "yandex-mobile-ads";




export default function App() {
  const [exitModalVusible, setExitModalVisible] = useState(false);
  const [showExtraId, setShowExtraId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [today, setToday] = useState(format(new Date(), "dd.MM.yyyy")); // формат для отображения в UI

  const [allTodos, setAllTodos] = useState<TodoItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAll, setShowAll] = useState(false);

  const [editData, setEditData] = useState<TodoItem | null>(null);
  const [showDatepicker, setShowDatepicker] = useState(false);

  const { width } = Dimensions.get('window');

  const [bannerSize, setBannerSize] = useState<BannerAdSize | null>(null);

  useEffect(() => {
    BannerAdSize.stickySize(width).then(setBannerSize);
  }, []);

  const flatListRef = useRef<FlatList>(null);



  useEffect(() => {
    (async () => {
      // Configure the user privacy data policy before init sdk
      await MobileAds.initialize();
    })();
  })

  const isExpired = (todo: TodoItem) =>
    isBefore(
      parse(todo.nextDate, "yyyy-MM-dd", new Date()),
      startOfDay(new Date()),
    );

  const isToday = (todo: TodoItem) =>
    isSameDay(parse(todo.nextDate, "yyyy-MM-dd", new Date()), selectedDate);

  const isFuture = (todo: TodoItem) =>
    isAfter(parse(todo.nextDate, "yyyy-MM-dd", new Date()), startOfDay(new Date()));

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

  const onDateChange = (type: "prev" | "next") => {
    setSelectedDate((prev) =>
      type === "prev" ? subDays(prev, 1) : addDays(prev, 1),
    );
  };

  const onAddTodo = async (newTask: TodoItem) => {
    await addTodo(newTask);

    setAllTodos((prev) => [newTask, ...prev]);
  };

  const onUpdateTodo = async (id: number, updatedTodo: TodoItem) => {
    await updateTodo(id, updatedTodo);

    getAllTodos();
  }

  const onFilterChange = () => {
    setShowAll((prev) => !prev);
    setSelectedDate(new Date());
  };

  const openEditModal = (editData: TodoItem) => {
    setEditData(editData);
    setShowAddModal(true);
  }

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const onNextDateChange = (event: any, selectedDate?: Date) => {

    setShowDatepicker(Platform.OS === "ios");
    if (selectedDate) setSelectedDate(selectedDate);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar style="dark" />
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
            disabled={isBefore(
              parse(today, "dd.MM.yyyy", new Date()),
              new Date(),
            )}
          />
          <Pressable onPress={() => setShowDatepicker(true)}>
            <Text style={styles.dateText}> {today} </Text>
          </Pressable>
          {showDatepicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onNextDateChange}
              minimumDate={new Date()}
            />
          )}

          <CustomButton
            onClick={() => onDateChange("next")}
            text=">"
            variant="ghost"
          />
        </View>

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
              setShowExtraId={setShowExtraId}
              showExtraId={showExtraId}
              getAllTodos={getAllTodos}
              openEditModal={() => openEditModal(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>На сегодня задач нет</Text>
          } // TODO: добавить кастомный компонент
          ListFooterComponent={
            displayedTodos.length > 10 ? (
              <Pressable style={styles.backToTopButton} onPress={scrollToTop}>
                <Text style={styles.backToTopButtonText}>
                  К началу списка ↑
                </Text>
              </Pressable>
            ) : null
          }
        />
        {
          bannerSize && <BannerView
            size={bannerSize}
            adRequest={{
              adUnitId: 'R-M-19204363-1',
            }}
            style={{ width: '100%', height: 100 }}
            onAdLoaded={() => console.log('loaded')}
            onAdFailedToLoad={(e) => console.log('error', e.nativeEvent)}
          />
        }


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

        <AddTodo
          showModal={showAddModal}
          closeModal={onModalClose}
          onAddTodo={onAddTodo}
          onUpdateTodo={onUpdateTodo}
          editData={editData}
          setEditData={setEditData}
        />
      </View>
    </SafeAreaView>
  );
}
