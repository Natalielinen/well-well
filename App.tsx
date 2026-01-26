import { useState } from "react";
import { View, Text, ScrollView, Button, Modal, Pressable } from "react-native";
import Todo from "./components/Todo/Todo";
import { TodoItem } from "./components/Todo/types/todo";

const todos: TodoItem[] = [
  {
    id: 1,
    title: "title",
    description: "description",
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
      style={{
        flex: 1,
        backgroundColor: "#EFD9F6",
      }}
    >
      <View
        style={{
          width: "100%",
          height: 50,
          backgroundColor: "#9C51B6",
          marginTop: 50,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View style={{ width: 100 }}>
          <Button title="Add" onPress={() => console.log("pressed")} />
        </View>
        <View style={{ width: 100 }}>
          <Button title="Exit" onPress={() => setExitModalVisible(true)} />
        </View>
      </View>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{
          alignItems: "center",
          rowGap: 24,
          justifyContent: "flex-start",
          paddingTop: 16,
          paddingBottom: 52,
        }}
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
