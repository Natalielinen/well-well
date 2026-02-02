import { useState } from "react";
import { View, Text, ScrollView, Button, Modal } from "react-native";
import Todo from "./components/Todo/Todo";
import { TodoItem } from "./components/Todo/types/todo";
import { styles } from "./styles"
import CustomButton from "./ui/CustomButton/CustomButton";

const todos: TodoItem[] = [
  {
    id: 1,
    title: "Помыть посуду",
    description: "Помыть всю посуду в раковине.",
    extraInfo: "extraInfo",
  },
  {
    id: 2,
    title: "title",
    description: "description",
    extraInfo: "extraInfo",
  },
  {
    id: 3,
    title: "title",
    description: "description",
    extraInfo: "extraInfo",
  },
  {
    id: 4,
    title: "title",
    description: "description",
    extraInfo: "extraInfo",
  },
  {
    id: 5,
    title: "title",
    description: "description",
    extraInfo: "extraInfo",
  },
  {
    id: 6,
    title: "title",
    description: "description",
    extraInfo: "extraInfo",
  },
  {
    id: 7,
    title: "title",
    description: "description",
    extraInfo: "extraInfo",
  },
  {
    id: 8,
    title: "title",
    description: "description",
    extraInfo: "extraInfo",
  },
  {
    id: 9,
    title: "title",
    description: "description",
    extraInfo: "extraInfo",
  },
  {
    id: 10,
    title: "title",
    description: "description",
    extraInfo: "extraInfo",
  },
];

export default function App() {

  const [exitModalVusible, setExitModalVisible] = useState(false);
  const [showExtraId, setShowExtraId] = useState<number | null>(null);

  return (
    <View
      style={styles.appContainer}
    >
      <View
        style={styles.appHeader}
      >
        {/* TODO: добавить бургер меню */}
        <CustomButton onClick={() => console.log("click")} text="+" variant="secondary" />
      </View>
      <View style={styles.date}>
        <CustomButton onClick={() => console.log("left")} text="<" variant="ghost" />
        <Text style={styles.dateText}> Сегодня: 02.02.2026 </Text>
        <CustomButton onClick={() => console.log("right")} text=">" variant="ghost" />
      </View>
      <ScrollView
        contentContainerStyle={styles.appScrollableContainer}
      >
        {todos.map((todo) => {
          return (
            <Todo setShowExtraId={setShowExtraId} showExtraId={showExtraId} todo={todo} key={todo.id} />
          );
        })}
      </ScrollView>
      <Modal visible={exitModalVusible} onRequestClose={() => setExitModalVisible(false)} animationType="fade">
        <View>
          <Text>Are you sure you want to exit?</Text>
        </View>
        <View>
          <Button title="close" onPress={() => setExitModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}
