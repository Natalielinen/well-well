import { Pressable, View, Text } from "react-native";
import { TodoItem } from "../../types/todo";
import { styles } from "../../styles";
import { sizes } from "../../constants/todo";
import { format } from "date-fns";
import { ru } from 'date-fns/locale';
import Octicons from '@expo/vector-icons/Octicons';
import CustomButton from "../../ui/CustomButton/CustomButton";

type TodoProps = {
    todo: TodoItem;
    showExtraId: number | null;
    setShowExtraId: (id: number | null) => void;
    isTodoExpired: boolean;
};
// TODO: добавить чекбокс для отметки сделанных дел
export default function Todo({ todo, showExtraId, setShowExtraId, isTodoExpired }: TodoProps) {

    const onPress = () => {
        setShowExtraId(showExtraId === todo.id ? null : todo.id);
    }

    const formattedDate = format(new Date(todo.nextDate), "d LLL yyyy", { locale: ru });

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
                        <Text style={styles.todoTitle}>
                            {todo.title}
                        </Text>
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
                    <CustomButton onClick={() => console.log("done")} text="Выполнить" variant="secondary" />
                    <CustomButton onClick={() => console.log("delete")} text="Удалить" variant="secondary" />
                    <CustomButton onClick={() => console.log("delete")} text="Редактировать" variant="secondary" />

                </View>
            )}
        </>

    )
}