import {
    Modal,
    View,
    Text,
    TextInput,
    Switch,
    Platform,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { styles } from "./styles";
import { useEffect, useState } from "react";
import { colors } from "../../themes/colors";
import { sizeOptions, isValidSize, isValidRepeatFrequency } from "../../constants/todo";
import { TodoItem } from "../../types/todo";
import { isAfter, isBefore, startOfDay } from "date-fns";
import { defaultReminderDate, parseDateKey, toDateKey } from "../../utils/time";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

type AddTodoProps = {
    showModal: boolean;
    closeModal: () => void;
    onAddTodo: (todo: TodoItem) => void;
    onUpdateTodo: (id: number, todo: TodoItem) => void;
    editData: TodoItem | null;
    setEditData: (todo: TodoItem | null) => void;
    currentDate: Date;
};

export default function AddTodo({
    showModal,
    editData = null,
    closeModal,
    onAddTodo,
    onUpdateTodo,
    setEditData,
    currentDate,
}: AddTodoProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isRepeat, setIsRepeat] = useState(false);
    const [repeatFrequency, setRepeatFrequency] = useState("");
    const [size, setSize] = useState(sizeOptions[0].value);
    const [error, setError] = useState({
        title: "",
        repeatFrequency: "",
        minDate: "",
        remindDate: "",
    });

    const [nextDate, setNextDate] = useState(new Date());
    const [showDatepicker, setShowDatepicker] = useState(false);

    const [showRemindField, setShowRemindField] = useState(false);
    const [remindDate, setRemindDate] = useState<Date | null>(null);
    const [showRemindDatepicker, setShowRemindDatepicker] = useState(false);
    const [showRemindTimePicker, setShowRemindTimePicker] = useState(false);
    const [reminderTouched, setReminderTouched] = useState(false);

    const onRemindToggle = (enabled: boolean) => {
        setShowRemindField(enabled);
        setRemindDate(enabled ? defaultReminderDate(nextDate) : null);
        setReminderTouched(true);
        setShowRemindDatepicker(false);
        setShowRemindTimePicker(false);
        setError((prev) => ({ ...prev, remindDate: "" }));
    };

    useEffect(() => {
        if (currentDate) {
            setNextDate(currentDate);
        }
    }, [currentDate]);

    useEffect(() => {
        if (editData) {
            setTitle(editData.title);
            setDescription(editData.description);
            setIsRepeat(editData.isRepeat);
            setRepeatFrequency(editData.repeatFrequency.toString());
            setSize(editData.size);
            setNextDate(parseDateKey(editData.nextDate));
            setRemindDate(
                editData.reminderDate ? new Date(editData.reminderDate) : null,
            );
            setShowRemindField(!!editData.reminderDate);
            setReminderTouched(false);
        }
    }, [editData]);

    const clearFields = () => {
        setTitle("");
        setDescription("");
        setIsRepeat(false);
        setRepeatFrequency("");
        setSize(sizeOptions[0].value);
        setNextDate(currentDate ?? new Date());
        setRemindDate(null);
        setShowRemindField(false);
        setShowRemindDatepicker(false);
        setShowRemindTimePicker(false);
        setReminderTouched(false);
    };

    const clearErrors = () => {
        setError({
            title: "",
            repeatFrequency: "",
            minDate: "",
            remindDate: "",
        });
    };

    const onNextDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setError({
            ...error,
            minDate: "",
        });

        setShowDatepicker(Platform.OS === "ios");
        if (selectedDate) setNextDate(selectedDate);
    };

    const onRemindDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowRemindDatepicker(false);
        if (event.type === "dismissed" || !selectedDate) return;

        // Берём текущий remindDate (или new Date()) как основу
        const updated = remindDate ? new Date(remindDate) : new Date();
        updated.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

        setRemindDate(updated);
        setReminderTouched(true);
        setError((prev) => ({ ...prev, remindDate: "" }));
        setShowRemindTimePicker(true);
    };

    const onRemindTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
        setShowRemindTimePicker(false);
        if (event.type === "dismissed" || !selectedTime) return;

        // Берём уже сохранённую дату и добавляем время
        const updated = remindDate ? new Date(remindDate) : new Date();
        updated.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

        setRemindDate(updated);
        setReminderTouched(true);
        setError((prev) => ({ ...prev, remindDate: "" }));
    };
    const onModalClose = () => {
        clearFields();
        closeModal();
        clearErrors();
        setEditData(null);
    };

    const onCreate = async () => {
        if (!title) {
            setError({
                ...error,
                title: "Введите название дела",
            });
            return;
        }

        if (isRepeat && !repeatFrequency) {
            setError({
                ...error,
                repeatFrequency: "Введите частоту повторения",
            });
            return;
        }

        if (isBefore(nextDate, startOfDay(new Date()))) {
            setError({
                ...error,
                minDate: "Дата не может быть в прошлом",
            });
            return;
        }

        if (isRepeat && !isValidRepeatFrequency(Number(repeatFrequency))) {
            setError({
                ...error,
                repeatFrequency: "Частота повторения должна быть положительным целым числом",
            });
            return;
        }

        if (!isValidSize(size)) {
            setError({
                ...error,
                title: "Некорректный размер задачи",
            });
            return;
        }

        const reminderChanged = reminderTouched || !editData?.reminderDate ||
            remindDate?.getTime() !== new Date(editData.reminderDate).getTime();
        if (showRemindField && (!remindDate || (reminderChanged && !isAfter(remindDate, new Date())))) {
            setError({ ...error, remindDate: "Время напоминания уже прошло" });
            return;
        }

        const id = editData ? editData.id : Date.now();

        const newTask: TodoItem = {
            id,
            title,
            description,
            lastUpdated: toDateKey(new Date()),
            isRepeat,
            repeatFrequency: Number(repeatFrequency),
            nextDate: toDateKey(nextDate),
            size,
            reminderDate: showRemindField && remindDate ? remindDate.toISOString() : undefined,
            notificationId: editData?.notificationId ?? undefined,
        };

        // =========================
        // 💾 SAVE
        // =========================
        if (editData) {
            onUpdateTodo(editData.id, newTask);
        } else {
            onAddTodo(newTask);
        }

        onModalClose();
    };

    return (
        <Modal
            visible={showModal}
            onRequestClose={closeModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <ScrollView>
                <View style={styles.container}>
                    <View style={styles.handle} />
                    <Text style={styles.title}>
                        {editData ? "Редактировать дело" : "Добавить дело"}
                    </Text>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Название</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Что нужно сделать?"
                                placeholderTextColor={colors.textMuted}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Описание</Text>
                            <TextInput
                                style={[styles.input, styles.textarea]}
                                placeholder="Добавьте детали..."
                                placeholderTextColor={colors.textMuted}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Повторяющееся дело?</Text>
                            <Switch
                                value={isRepeat}
                                onValueChange={setIsRepeat}
                                trackColor={{ false: colors.border, true: colors.primaryLight }}
                                thumbColor={isRepeat ? colors.primary : "#ffffff"}
                                ios_backgroundColor={colors.border}
                            />
                        </View>

                        {isRepeat && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Повторять каждые (дней)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="2"
                                    placeholderTextColor={colors.textMuted}
                                    value={repeatFrequency}
                                    onChangeText={setRepeatFrequency}
                                    keyboardType="numeric"
                                />
                            </View>
                        )}

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Длительность</Text>
                                <View style={styles.selectContainer}>
                                    {sizeOptions.map((so) => (
                                        <TouchableOpacity
                                            key={so.value}
                                            style={[
                                                styles.selectOption,
                                                size === so.value && styles.selectOptionActive,
                                            ]}
                                            onPress={() => setSize(so.value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.selectText,
                                                    size === so.value && styles.selectTextActive,
                                                ]}
                                            >
                                                {so.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Дата выполнения</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatepicker(true)}
                            >
                                <Text style={styles.dateText}>
                                    {nextDate.toLocaleDateString("ru-RU", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </Text>
                            </TouchableOpacity>
                            {showDatepicker && (
                                <DateTimePicker
                                    value={nextDate}
                                    mode="date"
                                    display={Platform.OS === "ios" ? "spinner" : "default"}
                                    onChange={onNextDateChange}
                                    minimumDate={new Date()}
                                />
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.toggleRow}>
                                <Text style={styles.toggleLabel}>Напомнить?</Text>
                                <Switch
                                    value={showRemindField}
                                    onValueChange={onRemindToggle}
                                    trackColor={{
                                        false: colors.border,
                                        true: colors.primaryLight,
                                    }}
                                    thumbColor={showRemindField ? colors.primary : "#ffffff"}
                                    ios_backgroundColor={colors.border}
                                />
                            </View>

                            {showRemindField && (
                                <View>
                                    <TouchableOpacity
                                        style={styles.dateButton}
                                        onPress={() => setShowRemindDatepicker(true)}
                                    >
                                        <Text style={styles.dateText}>
                                            {remindDate?.toLocaleString("ru-RU", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </Text>
                                    </TouchableOpacity>
                                    {error.remindDate ? (
                                        <Text style={styles.errorText}>{error.remindDate}</Text>
                                    ) : null}
                                    {showRemindDatepicker && (
                                        <DateTimePicker
                                            value={remindDate!}
                                            mode="date"
                                            display="default"
                                            onChange={onRemindDateChange}
                                            minimumDate={nextDate}
                                        />
                                    )}
                                    {showRemindTimePicker && (
                                        <DateTimePicker
                                            value={remindDate!}
                                            mode="time"
                                            display="default"
                                            onChange={onRemindTimeChange}
                                        />
                                    )}
                                </View>
                            )}
                        </View>
                    </View>

                    {(error.title || error.repeatFrequency || error.minDate) && (
                        <View style={styles.form}>
                            {error.title ? (
                                <Text style={styles.errorText}>{error.title}</Text>
                            ) : null}
                            {error.repeatFrequency ? (
                                <Text style={styles.errorText}>{error.repeatFrequency}</Text>
                            ) : null}
                            {error.minDate ? (
                                <Text style={styles.errorText}>{error.minDate}</Text>
                            ) : null}
                        </View>
                    )}

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.btnSecondary}
                            onPress={onModalClose}
                        >
                            <Text style={styles.btnSecondaryText}>Закрыть</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.btnPrimary,
                                !title.trim() && styles.btnPrimaryDisabled,
                            ]}
                            onPress={onCreate}
                            disabled={!title.trim()}
                        >
                            <Text style={styles.btnPrimaryText}>Сохранить</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </Modal>
    );
}
