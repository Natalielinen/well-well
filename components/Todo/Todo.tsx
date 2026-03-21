import { Pressable, View, Text, Alert } from "react-native";
import { TodoItem } from "../../types/todo";
import { styles } from "../../styles";
import { sizes } from "../../constants/todo";
import { format } from "date-fns";
import { ru } from 'date-fns/locale';
import Octicons from '@expo/vector-icons/Octicons';
import Feather from '@expo/vector-icons/Feather';
import CustomButton from "../../ui/CustomButton/CustomButton";
import { removeTodo } from "../../storage/todoStorage";

type TodoProps = {
    todo: TodoItem;
    showExtraId: number | null;
    setShowExtraId: (id: number | null) => void;
    isTodoExpired: boolean;
    getAllTodos: () => Promise<void>;
};
export default function Todo({ todo, showExtraId, setShowExtraId, isTodoExpired, getAllTodos }: TodoProps) {

    const showAlert = (title: string, message: string) => {
        Alert.alert(
            title,
            message,
            [
                {
                    text: 'OK',
                    onPress: getAllTodos,
                },
            ],
        );
    };


    const onPress = () => {
        setShowExtraId(showExtraId === todo.id ? null : todo.id);
    }

    const formattedDate = format(new Date(todo.nextDate), "d LLL yyyy", { locale: ru });

    const onTaskComplete = async () => {
        if (!todo.isRepeat) {
            await removeTodo(todo.id);
            showAlert("Успешно", "Выполнена не повторяющаяся задача. Задача удалена из списка дел");
        }
    }

    return (
        <>
            <Pressable
                onPress={onPress}
                key={todo.id}
                style={[styles.todoItem, isTodoExpired ? styles.expiredItem : {}]}>

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
                    <View>
                        <View style={styles.todoHeader}>
                            <Text style={styles.todoTitle}>
                                {todo.title}
                            </Text>
                            {todo.isRepeat && <Feather name="repeat" size={18} color="black" />}

                        </View>

                        <Text style={styles.todoDescription}>{todo.description}</Text>
                    </View>

                    <View style={styles.todoFooter}>
                        <Octicons name={showExtraId === todo.id ? "chevron-up" : "chevron-down"} size={24} color="black" />
                        <Text style={styles.todoFooterText}>{formattedDate}</Text>
                    </View>

                </View>

            </Pressable>

            {showExtraId === todo.id && (
                <View style={styles.todoActions}>
                    <CustomButton onClick={onTaskComplete} text="Выполнить" variant="secondary" />
                    <CustomButton onClick={() => console.log("delete")} text="Удалить" variant="secondary" />
                    <CustomButton onClick={() => console.log("delete")} text="Редактировать" variant="secondary" />


                </View>
            )}
        </>

    )
}