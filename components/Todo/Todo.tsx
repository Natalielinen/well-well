import { View, Text, Alert, TouchableOpacity } from "react-native";
import { useRef } from "react";
import { TodoItem } from "../../types/todo";
import { styles } from "./styles";
import { sizeOptions, sizes } from "../../constants/todo";
import { format } from "date-fns";
import { formatTime, parseDateKey, toDateKey } from "../../utils/time";
import { ru } from "date-fns/locale";
import { getTodo, patchTodo, removeTodo } from "../../storage/todoStorage";
import { nextRecurrenceDate, nextReminderIso } from "../../utils/recurrence";
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
import { notifyReminderFailed, rescheduleNextNotification } from "../../hooks/useNotifications";

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
    const { cancelNotification } = useNotifications();
    const isCompletingRef = useRef(false);
    const isChoosingDateRef = useRef(false);

    const changedTask = async () => {
        await getAllTodos();
        Alert.alert("Задача изменена", "Проверьте актуальные данные и повторите выполнение");
    };

    const completeSingleTask = async () => {
        if (isCompletingRef.current) return;
        isCompletingRef.current = true;
        try {
            const current = await getTodo(todo.id);
            if (!current) {
                await getAllTodos();
                return;
            }
            if (current.isRepeat || current.nextDate !== todo.nextDate) {
                await changedTask();
                return;
            }
            if (current.notificationId) {
                try {
                    await cancelNotification(current.notificationId);
                } catch {
                    // Неизвестное или уже сработавшее уведомление не блокирует выполнение.
                }
            }
            const latest = await getTodo(current.id);
            if (!latest || latest.isRepeat || latest.nextDate !== current.nextDate ||
                latest.reminderDate !== current.reminderDate || latest.notificationId !== current.notificationId) {
                await changedTask();
                return;
            }
            await removeTodo(current.id);
            await getAllTodos();
            showAlert("Успешно", "Выполнена не повторяющаяся задача. Задача удалена из списка дел");
        } catch {
            Alert.alert("Ошибка", "Не удалось завершить задачу. Обновите список и попробуйте снова");
        } finally {
            isCompletingRef.current = false;
        }
    };

    const handleCompleteTask = async (base: "today" | "taskDate"): Promise<string | undefined> => {
        if (isCompletingRef.current) return;
        isCompletingRef.current = true;
        try {
            const current = await getTodo(todo.id);
            if (!current) {
                await getAllTodos();
                return;
            }
            if (!current.isRepeat || current.nextDate !== todo.nextDate) {
                await changedTask();
                return;
            }
            const nextDate = nextRecurrenceDate(
                base === "today" ? new Date() : parseDateKey(current.nextDate),
                current.repeatFrequency,
            );
            let reminderDate = nextReminderIso(nextDate, current.reminderDate);
            let notificationId: string | undefined;
            let reminderFailed = false;
            try {
                ({ notificationId } = await rescheduleNextNotification({ ...current, nextDate, reminderDate }));
            } catch {
                reminderDate = undefined;
                notificationId = undefined;
                reminderFailed = true;
            }
            const unchanged = (latest: TodoItem) =>
                latest.isRepeat === current.isRepeat &&
                latest.nextDate === current.nextDate &&
                latest.repeatFrequency === current.repeatFrequency &&
                latest.reminderDate === current.reminderDate &&
                latest.notificationId === current.notificationId;
            const updated = await patchTodo(current.id, {
                lastUpdated: toDateKey(new Date()), nextDate, reminderDate, notificationId,
            }, unchanged);
            // Если запись удалили во время ожидания системного API, не оставляем уведомление-сироту.
            if (!updated && notificationId) {
                try { await cancelNotification(notificationId); } catch { /* Отмена по возможности. */ }
            }
            await getAllTodos();
            if (!updated) {
                Alert.alert("Задача изменена", "Проверьте актуальные данные и повторите выполнение");
                return;
            }
            if (reminderFailed) {
                await notifyReminderFailed();
                // Не перекрываем сообщение об ошибке вторым Alert об успешном выполнении.
                return;
            }
            return nextDate;
        } catch {
            Alert.alert("Ошибка", "Не удалось завершить задачу. Обновите список и попробуйте снова");
        } finally {
            isCompletingRef.current = false;
        }
    };

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
            },
        ]);
    };

    const showAlertForExpiredTask = (isFuture: boolean) => {
        if (isChoosingDateRef.current || isCompletingRef.current) return;
        isChoosingDateRef.current = true;
        let settled = false;
        const dismiss = () => {
            if (settled) return;
            settled = true;
            isChoosingDateRef.current = false;
        };
        const choose = async (base: "today" | "taskDate") => {
            if (settled) return;
            dismiss();
            await handleCompleteTask(base);
        };
        Alert.alert(
            "Внимание!",
            isFuture
                ? "Дата выполнения задачи еще не наступила. Какую дату выполнения вы хотите выбрать?"
                : "Задача была просрочена, какую дату выполнения вы хотите выбрать?",
            [
                {
                    text: "Сегодня",
                    onPress: async () => {
                        await choose("today");
                    },
                },
                {
                    text: "Дата в задаче",
                    onPress: async () => {
                        await choose("taskDate");
                    },
                },
                { text: "Отмена", style: "cancel", onPress: dismiss },
            ],
            { cancelable: true, onDismiss: dismiss },
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
        if (isCompletingRef.current || isChoosingDateRef.current) return;
        if (!todo.isRepeat) {
            await completeSingleTask();
            // Повторяющаяся задача, дата не наступила
        } else if (todo.isRepeat && isFuture) {
            showAlertForExpiredTask(true);
            // Повторяющаяся не просроченная задача
        } else if (todo.isRepeat && !isTodoExpired) {
            const nextDate = await handleCompleteTask("taskDate");
            if (!nextDate) return;
            showAlert(
                "Успешно",
                `Выполнена повторяющаяся задача. Дата следующего выполнения: ${format(parseDateKey(nextDate), "d LLL yyyy", { locale: ru })}`,
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
                    {parseDateKey(todo.nextDate).toLocaleDateString("ru-RU", {
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

