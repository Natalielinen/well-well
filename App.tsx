import { View, Text } from "react-native";

const todos = [{
  id: 1,
  title: "title",
  description: "description",
},
{
  id: 2,
  title: "title",
  description: "description",
}, {
  id: 3,
  title: "title",
  description: "description",
}];

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
            key={todo.id}
            style={{ padding: 16, width: "95%", height: 80, backgroundColor: "#FFFFFF", borderRadius: 8, boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>{todo.title}</Text>
            <Text style={{ fontSize: 14 }}>{todo.description}</Text>
          </View>
        );
      })}
    </View>
  );
}
