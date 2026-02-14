import { useState } from "react";
import { View, Text, ScrollView, Button, Modal, FlatList, Pressable } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Todo from "./components/Todo/Todo";
import { TodoItem } from "./types/todo";
import { styles } from "./styles"
import CustomButton from "./ui/CustomButton/CustomButton";
import AddTodo from "./components/AddTodo/AddTodo";

const todos: TodoItem[] = [
  {
    id: 1,
    title: "Полить цветы (все) и рыхлить",
    description: "",
    lastUpdated: "2026-02-07",
    isRepeat: true,
    repeatFrequency: 7,
    nextDate: "2026-02-14",
    size: 1,
    isExpired: false
  },
  {
    id: 2,
    title: "Убрать у птиц",
    description: "",
    lastUpdated: "2026-02-07",
    isRepeat: true,
    repeatFrequency: 7,
    nextDate: "2026-02-14",
    size: 1,
    isExpired: false
  },
  {
    id: 3,
    title: "Разобрать на стуле и вдоль стены",
    description: "",
    lastUpdated: "2026-01-31",
    isRepeat: true,
    repeatFrequency: 14,
    nextDate: "2026-02-14",
    size: 3,
    isExpired: false
  },
  {
    id: 5,
    title: "test 2",
    description: "",
    lastUpdated: "2026-01-31",
    isRepeat: true,
    repeatFrequency: 14,
    nextDate: "2026-02-14",
    size: 5,
    isExpired: false
  },
  {
    id: 4,
    title: "test",
    description: "",
    lastUpdated: "2026-01-31",
    isRepeat: true,
    repeatFrequency: 14,
    nextDate: "2026-02-14",
    size: 8,
    isExpired: true
  },
  {
    id: 6,
    title: "test 3",
    description: "",
    lastUpdated: "2026-01-31",
    isRepeat: true,
    repeatFrequency: 14,
    nextDate: "2026-02-14",
    size: 13,
    isExpired: false
  }

];

export default function App() {

  const [exitModalVusible, setExitModalVisible] = useState(false);
  const [showExtraId, setShowExtraId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const onModalClose = () => setShowAddModal(false);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View
        style={styles.appContainer}
      >
        <View
          style={styles.appHeader}
        >
          {/* TODO: добавить бургер меню */}
          <CustomButton onClick={() => setShowAddModal(true)} text="+" variant="secondary" />
        </View>
        <View style={styles.date}>
          <CustomButton onClick={() => console.log("left")} text="<" variant="ghost" />
          <Text style={styles.dateText}> Сегодня: 02.02.2026 </Text>
          <CustomButton onClick={() => console.log("right")} text=">" variant="ghost" />
        </View>

        <FlatList
          contentContainerStyle={styles.appScrollableContainer}
          data={todos} renderItem={({ item }) => {
            return <Todo setShowExtraId={setShowExtraId} showExtraId={showExtraId} todo={item} />
          }}
          ListEmptyComponent={<Text style={styles.emptyListText}>В списке нет дел</Text>}// TODO: добавить кастомный компонент
          ListFooterComponent={todos.length > 10 ? <Pressable style={styles.backToTopButton}><Text style={styles.backToTopButtonText}>К началу списка ↑</Text></Pressable> : null}
        />

        <Modal visible={exitModalVusible} onRequestClose={() => setExitModalVisible(false)} animationType="fade">
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
