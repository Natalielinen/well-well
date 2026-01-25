import { useState } from "react";
import { View, Text, ScrollView, Button, Modal, Pressable } from "react-native";

const todos = [
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
            <Pressable
              onPress={() => setShowExtraId(todo.id)}
              key={todo.id}
              style={{
                padding: 16,
                width: "95%",
                height: 80,
                backgroundColor: "#FFFFFF",
                borderRadius: 8,
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
              }}>

              <View
                key={todo.id}

              >
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {todo.title}
                </Text>
                <Text style={{ fontSize: 14 }}>{todo.description}</Text>
              </View>
              {
                showExtraId === todo.id && <View><Text>{todo.extraInfo}</Text></View>
              }
            </Pressable>
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
