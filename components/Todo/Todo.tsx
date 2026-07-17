import { View, Text, Alert, TouchableOpacity } from "react-native";
import { TodoItem } from "../../types/todo";
import { styles } from "./styles";
import { sizeOptions, sizes } from "../../constants/todo";
import { addDays, format, formatDate } from "date-fns";
import { parseTime, formatTime } from "../../utils/time";
import { ru } from "date-fns/locale";
import { removeTodo, updateTodo } from "../../storage/todoStorage";
import { colors } from "../../themes/colors";
import {
    Repeat,
    Clock,
    Trash2,
    Pen,
    FileExclamationPoint,
    Bell,
} from "lucide-react-native";
import { useNotifications } from "../../hooks/useNotifications";
import { rescheduleNextNotification } from "../../hooks/useNotifications";

type TodoProps = {
    todo: TodoItem;
    isTodoExpired: boolean;
    isFuture: boolean;
    getAllTodos: () => Promise<void>;
    openEditModal: () => void;
};
export default function Todo({
    todo,
    isTodoExpired,
    isFuture,
    getAllTodos,
    openEditModal,
}: TodoProps) {
    const { cancelNotification, scheduleNotification } = useNotifications();

    const getUpdatedTime = (nextDate: Date | string, reminderTime: string) => {
        const finalDateTime = new Date(nextDate);
        const parsed = parseTime(reminderTime);
        if (parsed) {
            finalDateTime.setHours(parsed.getHours());
            finalDateTime.setMinutes(parsed.getMinutes());
        }
        return finalDateTime;
    }

    const handleCompleteTask = async (lastUpdated: string, nextDate: string, reminderDate?: string) => {
        const updatedTodo = { ...todo, lastUpdated, nextDate, reminderDate };
        const { notificationId, adjustedDate } = await rescheduleNextNotification(updatedTodo);
        await updateTodo(todo.id, {
            ...updatedTodo,
            ...(notificationId && { notificationId }),
            ...(adjustedDate && { reminderDate: adjustedDate.toISOString() }),
        });
    }

    const onTaskDelete = async () => {
        if (todo.notificationId) {
            await cancelNotification(todo.notificationId);
        }
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
                        const newNextDate = format(
                            addDays(new Date(), todo.repeatFrequency),
                            "yyyy-MM-dd",
                        );
                        const reminderTime = todo.reminderDate ? formatTime(new Date(todo.reminderDate)) : "";

                        await handleCompleteTask(
                            format(new Date(), "yyyy-MM-dd"),
                            newNextDate,
                            todo.reminderDate ? format(getUpdatedTime(newNextDate, reminderTime), 'yyyy-MM-dd HH:mm') : undefined
                        )

                        await getAllTodos();
                    },
                },
                {
                    text: "Дата в задаче",
                    onPress: async () => {
                        const newNextDate = format(
                            addDays(new Date(todo.nextDate), todo.repeatFrequency),
                            "yyyy-MM-dd",
                        );
                        const reminderTime = todo.reminderDate ? formatTime(new Date(todo.reminderDate)) : "";
                        await handleCompleteTask(
                            format(new Date(), "yyyy-MM-dd"),
                            newNextDate,
                            todo.reminderDate ? format(getUpdatedTime(newNextDate, reminderTime), 'yyyy-MM-dd HH:mm') : undefined
                        );
                        await getAllTodos();
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

    const onTaskComplete = async () => {
        if (!todo.isRepeat) {
            await removeTodo(todo.id);
            showAlert(
                "Успешно",
                "Выполнена не повторяющаяся задача. Задача удалена из списка дел",
            );
            // Повторяющаяся задача, дата не наступила
        } else if (todo.isRepeat && isFuture) {
            showAlertForExpiredTask(true);
            // Повторяющаяся не просроченная задача
        } else if (todo.isRepeat && !isTodoExpired) {
            const newNextDate = addDays(
                new Date(todo.nextDate),
                todo.repeatFrequency,
            );

            const reminderTime = todo.reminderDate ? format(new Date(todo.reminderDate), 'HH:mm') : "";

            await handleCompleteTask(
                format(new Date(), "yyyy-MM-dd"),
                format(newNextDate, "yyyy-MM-dd"),
                todo.reminderDate ? format(getUpdatedTime(newNextDate, reminderTime), 'yyyy-MM-dd HH:mm') : undefined
            )
            showAlert(
                "Успешно",
                `Выполнена повторяющаяся задача. Дата следующего выполнения: ${format(newNextDate, "d LLL yyyy", { locale: ru })}`,
            );
        } else if (todo.isRepeat && isTodoExpired) {
            showAlertForExpiredTask(false);
        }
    };

    return (
        <View style={[styles.card, { borderLeftColor: sizes[todo.size].color }]}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <TouchableOpacity
                        style={styles.checkbox}
                        onPress={onTaskComplete}
                        activeOpacity={0.7}
                    ></TouchableOpacity>

                    <View style={styles.titleContainer}>
                        <View style={styles.titleWrapper}>
                            <Text style={styles.title}>{todo.title}</Text>
                            <View style={styles.badges}>
                                {isTodoExpired && (
                                    <View
                                        style={[
                                            styles.badge,
                                            { backgroundColor: colors.dangerLight },
                                        ]}
                                    >
                                        <FileExclamationPoint size={12} color={colors.danger} />
                                        <Text style={[styles.badgeText, { color: colors.danger }]}>
                                            Просрочена
                                        </Text>
                                    </View>
                                )}
                                {todo.repeatFrequency > 0 && (
                                    <View
                                        style={[
                                            styles.badge,
                                            { backgroundColor: colors.primaryGhost },
                                        ]}
                                    >
                                        <Repeat size={12} color={colors.primaryDark} />
                                        <Text
                                            style={[styles.badgeText, { color: colors.primaryDark }]}
                                        >
                                            Каждые {todo.repeatFrequency}{" "}
                                            {todo.repeatFrequency === 1
                                                ? "день"
                                                : todo.repeatFrequency < 5
                                                    ? "дня"
                                                    : "дней"}
                                        </Text>
                                    </View>
                                )}
                                <View
                                    style={[
                                        styles.badge,
                                        { backgroundColor: colors.warningLight },
                                    ]}
                                >
                                    <Clock size={12} color="#92400e" />
                                    <Text style={[styles.badgeText, { color: "#92400e" }]}>
                                        {
                                            sizeOptions.find((size) => size.value === todo.size)
                                                ?.label
                                        }{" "}
                                    </Text>
                                </View>
                                {
                                    todo.reminderDate && <View
                                        style={[
                                            styles.badge,
                                            { backgroundColor: colors.warningLight },
                                        ]}
                                    >
                                        <Bell size={12} color="#92400e" />
                                        <Text style={[styles.badgeText, { color: "#92400e" }]}>
                                            {
                                                formatTime(new Date(todo.reminderDate))
                                            }
                                        </Text>
                                    </View>
                                }
                            </View>
                        </View>

                        <View>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={openEditModal}
                                activeOpacity={0.7}
                            >
                                <Pen size={16} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            <Text style={styles.description}>{todo.description}</Text>

            <View style={styles.footer}>
                <Text style={styles.date}>
                    {new Date(todo.nextDate).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })}
                </Text>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={showDeleteAlert}
                    activeOpacity={0.7}
                >
                    <Trash2 size={16} color={colors.textMuted} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

