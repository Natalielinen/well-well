import { Pressable, View, Text } from "react-native";
import { TodoItem } from "./types/todo";


type TodoProps = {
    todo: TodoItem;
    showExtraId: number | null;
    setShowExtraId: (id: number | null) => void
};

export default function Todo({ todo, showExtraId, setShowExtraId }: TodoProps) {
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
    )
}