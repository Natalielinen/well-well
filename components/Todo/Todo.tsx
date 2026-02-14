import { Pressable, View, Text } from "react-native";
import { TodoItem } from "../../types/todo";
import { styles } from "../../styles";
import { sizes } from "../../constants/todo";

type TodoProps = {
    todo: TodoItem;
    showExtraId: number | null;
    setShowExtraId: (id: number | null) => void
};
//TODO: добавить цветную полосу в зависимости от веса задачи
// TODO: добавить чекбокс для отметки сделанных дел
export default function Todo({ todo, showExtraId, setShowExtraId }: TodoProps) {

    const onPress = () => {
        setShowExtraId(showExtraId === todo.id ? null : todo.id);
    }

    return (
        <Pressable
            onPress={onPress}
            key={todo.id}
            style={[styles.todoItem, todo.isExpired ? styles.expiredItem : {}]}>

            <View
                key={todo.id}
            >
                <View style={{
                    backgroundColor: sizes[todo.size].color,
                    height: 4,
                    width: sizes[todo.size].lineWidth,
                    borderRadius: 2,
                    marginBottom: 4
                }}></View>
                <Text style={styles.todoTitle}>
                    {todo.title}
                </Text>
                <Text style={styles.todoDescription}>{todo.description}</Text>
            </View>
        </Pressable>
    )
}