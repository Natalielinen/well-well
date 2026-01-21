import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

const todos = ["1", "2", "3"];

export default function App() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#EFD9F6",
        display: "flex",
        flexDirection: "column",
        rowGap: 24,
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: "100%",
          height: 50,
          backgroundColor: "#9C51B6",
          marginTop: 50,
        }}
      ></View>
      {todos.map((todo) => {
        return (
          <View
            style={{ width: "95%", height: 80, backgroundColor: "#FFFFFF", borderRadius: 8, boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
          ></View>
        );
      })}
    </View>
  );
}
