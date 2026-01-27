import { Pressable, View, Text } from "react-native";
import { TodoItem } from "./types/todo";
import { styles } from "../../styles";

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
            style={styles.todoItem}>

            <View
                key={todo.id}

            >
                <Text style={styles.todoTitle}>
                    {todo.title}
                </Text>
                <Text style={styles.todoDescription}>{todo.description}</Text>
            </View>
            {
                showExtraId === todo.id && <View><Text>{todo.extraInfo}</Text></View>
            }
        </Pressable>
    )
}