import { Pressable, View, Text, Alert } from "react-native";
import { TodoItem } from "../../types/todo";
import { styles } from "../../styles";
import { sizes } from "../../constants/todo";
import { addDays, format } from "date-fns";
import { ru } from "date-fns/locale";
import Octicons from "@expo/vector-icons/Octicons";
import CustomButton from "../../ui/CustomButton/CustomButton";
import { removeTodo, updateTodo } from "../../storage/todoStorage";
import { useEffect } from "react";

type TodoProps = {
    todo: TodoItem;
    showExtraId: number | null;
    setShowExtraId: (id: number | null) => void;
    isTodoExpired: boolean;
    isFuture: boolean;
    getAllTodos: () => Promise<void>;
    openEditModal: () => void;
};
export default function Todo({
    todo,
    showExtraId,
    setShowExtraId,
    isTodoExpired,
    isFuture,
    getAllTodos,
    openEditModal,
}: TodoProps) {
    const onTaskDelete = async () => {
        await removeTodo(todo.id);
        getAllTodos();
    };

    const showAlert = (title: string, message: string) => {
        Alert.alert(title, message, [
            {
                text: "OK",
                onPress: getAllTodos,
            },
        ]);
    };

    const showAlertForExpiredTask = (isFuture: boolean) => {
        Alert.alert(
            "Внимание!",
            isFuture
                ? "Дата выполнения задачи еще не наступила. Какую дату выполнения вы хотите выбрать?"
                : "Задача была просрочена, какую дату выполнения вы хотите выбрать?",
            [
                {
                    text: "Сегодня",
                    onPress: async () => {
                        await updateTodo(todo.id, {
                            ...todo,
                            lastUpdated: format(new Date(), "yyyy-MM-dd"),
                            nextDate: format(
                                addDays(new Date(), todo.repeatFrequency),
                                "yyyy-MM-dd",
                            ),
                        });
                        getAllTodos();
                    },
                },
                {
                    text: "Дата в задаче",
                    onPress: async () => {
                        await updateTodo(todo.id, {
                            ...todo,
                            lastUpdated: format(new Date(), "yyyy-MM-dd"),
                            nextDate: format(
                                addDays(new Date(todo.nextDate), todo.repeatFrequency),
                                "yyyy-MM-dd",
                            ),
                        });
                        getAllTodos();
                    },
                },
            ],
        );
    };

    const showDeleteAlert = () => {
        Alert.alert("Внимание!", "Вы уверены, что хотите удалить задачу?", [
            {
                text: "Да",
                onPress: onTaskDelete,
            },
            {
                text: "Нет",
                style: "cancel",
            },
        ]);
    };

    const onPress = () => {
        setShowExtraId(showExtraId === todo.id ? null : todo.id);
    };

    const formattedDate = format(new Date(todo.nextDate), "d LLL yyyy", {
        locale: ru,
    });

    const onTaskComplete = async () => {
        if (!todo.isRepeat) {
            await removeTodo(todo.id);
            showAlert(
                "Успешно",
                "Выполнена не повторяющаяся задача. Задача удалена из списка дел",
            );
        } else if (todo.isRepeat && isFuture) {
            showAlertForExpiredTask(true);
        } else if (todo.isRepeat && !isTodoExpired) {
            const newNextDate = addDays(
                new Date(todo.nextDate),
                todo.repeatFrequency,
            );
            await updateTodo(todo.id, {
                ...todo,
                lastUpdated: format(new Date(), "yyyy-MM-dd"),
                nextDate: format(newNextDate, "yyyy-MM-dd"),
            });
            showAlert(
                "Успешно",
                `Выполнена повторяющаяся задача. Дата следующего выполнения: ${format(newNextDate, "d LLL yyyy", { locale: ru })}`,
            );
        } else if (todo.isRepeat && isTodoExpired) {
            showAlertForExpiredTask(false);
        }
    };

    return (
        <>
            <Pressable
                onPress={onPress}
                key={todo.id}
                style={[styles.todoItem, isTodoExpired ? styles.expiredItem : {}]}
            >
                <View key={todo.id}>
                    <View
                        style={{
                            backgroundColor: sizes[todo.size].color,
                            height: 4,
                            width: sizes[todo.size].lineWidth,
                            borderRadius: 2,
                            marginBottom: 4,
                        }}
                    ></View>
                    <View>
                        <View style={styles.todoHeader}>
                            <Text style={styles.todoTitle}>{todo.title}</Text>
                            {todo.isRepeat && (
                                <Text style={styles.todoRepeat}>
                                    Каждые {todo.repeatFrequency} дней
                                </Text>
                            )}
                        </View>

                        <Text style={styles.todoDescription}>{todo.description}</Text>
                    </View>

                    <View style={styles.todoFooter}>
                        <Octicons
                            name={showExtraId === todo.id ? "chevron-up" : "chevron-down"}
                            size={24}
                            color="black"
                        />
                        <Text style={styles.todoFooterText}>{formattedDate}</Text>
                    </View>
                </View>
            </Pressable>

            {showExtraId === todo.id && (
                <View style={styles.todoActions}>
                    <CustomButton
                        onClick={onTaskComplete}
                        text="Выполнить"
                        variant="secondary"
                    />
                    <CustomButton
                        onClick={showDeleteAlert}
                        text="Удалить"
                        variant="secondary"
                    />
                    <CustomButton
                        onClick={openEditModal}
                        text="Изменить"
                        variant="secondary"
                    />
                </View>
            )}
        </>
    );
}
