import { Pressable, View, Text, Alert, TouchableOpacity } from "react-native";
import { TodoItem } from "../../types/todo";
import { styles } from "./styles";
import { sizeOptions, sizes } from "../../constants/todo";
import { addDays, format } from "date-fns";
import { ru } from "date-fns/locale";
import Octicons from "@expo/vector-icons/Octicons";
import CustomButton from "../../ui/CustomButton/CustomButton";
import { removeTodo, updateTodo } from "../../storage/todoStorage";
import { useEffect } from "react";
import { colors } from "../../themes/colors";
import { Check, ChevronDown, Repeat, Clock, Delete, Trash2, Pen, FileExclamationPoint } from 'lucide-react-native';

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
        <View style={[styles.card, { borderLeftColor: sizes[todo.size].color }]}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <TouchableOpacity
                        style={styles.checkbox}
                        onPress={onTaskComplete}
                        activeOpacity={0.7}
                    >

                    </TouchableOpacity>

                    <View style={styles.titleContainer}>
                        <View>
                            <Text style={styles.title}>
                                {todo.title}
                            </Text>
                            <View style={styles.badges}>

                                {
                                    isTodoExpired && (
                                        <View style={[styles.badge, { backgroundColor: colors.dangerLight }]}>
                                            <FileExclamationPoint size={12} color={colors.danger} />
                                            <Text style={[styles.badgeText, { color: colors.danger }]}>
                                                Просрочена
                                            </Text>
                                        </View>
                                    )
                                }
                                {todo.repeatFrequency > 0 && (
                                    <View style={[styles.badge, { backgroundColor: colors.primaryGhost }]}>
                                        <Repeat size={12} color={colors.primaryDark} />
                                        <Text style={[styles.badgeText, { color: colors.primaryDark }]}>
                                            Каждые {todo.repeatFrequency} {todo.repeatFrequency === 1 ? 'день' : todo.repeatFrequency < 5 ? 'дня' : 'дней'}
                                        </Text>
                                    </View>
                                )}
                                <View style={[styles.badge, { backgroundColor: colors.warningLight }]}>
                                    <Clock size={12} color="#92400e" />
                                    <Text style={[styles.badgeText, { color: '#92400e' }]}>{sizeOptions.find((size) => size.value === todo.size)?.label} </Text>
                                </View>
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
                    {new Date(todo.nextDate).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
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

        // <>
        //     <Pressable
        //         onPress={onPress}
        //         key={todo.id}
        //         style={[styles.todoItem, isTodoExpired ? styles.expiredItem : {}]}
        //     >
        //         <View key={todo.id}>
        //             <View
        //                 style={{
        //                     backgroundColor: sizes[todo.size].color,
        //                     height: 4,
        //                     width: sizes[todo.size].lineWidth,
        //                     borderRadius: 2,
        //                     marginBottom: 4,
        //                 }}
        //             ></View>
        //             <View>
        //                 <View style={styles.todoHeader}>
        //                     <Text style={styles.todoTitle}>{todo.title}</Text>
        //                     {todo.isRepeat && (
        //                         <Text style={styles.todoRepeat}>
        //                             Каждые {todo.repeatFrequency} дней
        //                         </Text>
        //                     )}
        //                 </View>

        //                 <Text style={styles.todoDescription}>{todo.description}</Text>
        //             </View>

        //             <View style={styles.todoFooter}>
        //                 <Octicons
        //                     name={showExtraId === todo.id ? "chevron-up" : "chevron-down"}
        //                     size={24}
        //                     color="black"
        //                 />
        //                 <Text style={styles.todoFooterText}>{formattedDate}</Text>
        //             </View>
        //         </View>
        //     </Pressable>

        //     {showExtraId === todo.id && (
        //         <View style={styles.todoActions}>
        //             <CustomButton
        //                 onClick={onTaskComplete}
        //                 text="Выполнить"
        //                 variant="secondary"
        //             />
        //             <CustomButton
        //                 onClick={showDeleteAlert}
        //                 text="Удалить"
        //                 variant="secondary"
        //             />
        //             <CustomButton
        //                 onClick={openEditModal}
        //                 text="Изменить"
        //                 variant="secondary"
        //             />
        //         </View>
        //     )}
        // </>
    );
}
