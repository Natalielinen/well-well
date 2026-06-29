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
import { sizeOptions } from "../../constants/todo";
import { TodoItem } from "../../types/todo";
import { format, isBefore, startOfDay } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";

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
    });

    const [nextDate, setNextDate] = useState(new Date());
    const [showDatepicker, setShowDatepicker] = useState(false);

    const [showRemindField, setShowRemindField] = useState(false);
    const [remindDate, setRemindDate] = useState<Date | null>(null);
    const [showRemindDatepicker, setShowRemindDatepicker] = useState(false);
    const [showRemindTimePicker, setShowRemindTimePicker] = useState(false);

    useEffect(() => {
        if (!editData) {
            if (showRemindField) {
                setRemindDate(new Date());
            } else {
                setRemindDate(null);
            }
        }

    }, [showRemindField]);

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
            setNextDate(new Date(editData.nextDate));
            setRemindDate(
                editData.reminderDate ? new Date(editData.reminderDate) : null,
            );
            setShowRemindField(!!editData.reminderDate);
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
    };

    const clearErrors = () => {
        setError({
            title: "",
            repeatFrequency: "",
            minDate: "",
        });
    };

    const onNextDateChange = (event: any, selectedDate?: Date) => {
        setError({
            ...error,
            minDate: "",
        });

        setShowDatepicker(Platform.OS === "ios");
        if (selectedDate) setNextDate(selectedDate);
    };

    const onRemindDateChange = (event: any, selectedDate?: Date) => {
        setShowRemindDatepicker(false);
        if (!selectedDate) return;

        // Берём текущий remindDate (или new Date()) как основу
        const updated = remindDate ? new Date(remindDate) : new Date();
        updated.setFullYear(selectedDate.getFullYear());
        updated.setMonth(selectedDate.getMonth());
        updated.setDate(selectedDate.getDate());

        setRemindDate(updated);
        setShowRemindTimePicker(true);
    };

    const onRemindTimeChange = (event: any, selectedTime?: Date) => {
        setShowRemindTimePicker(false);
        if (!selectedTime) return;

        // Берём уже сохранённую дату и добавляем время
        const updated = remindDate ? new Date(remindDate) : new Date();
        updated.setHours(selectedTime.getHours());
        updated.setMinutes(selectedTime.getMinutes());
        updated.setSeconds(0);

        setRemindDate(updated);
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

        if (showRemindField && remindDate && isBefore(remindDate, new Date())) {
            setError({ ...error, minDate: "Время напоминания не может быть в прошлом" });
            return;
        }

        const id = editData ? editData.id : Date.now();

        const newTask: TodoItem = {
            id,
            title,
            description,
            lastUpdated: format(new Date(), "yyyy-MM-dd"),
            isRepeat,
            repeatFrequency: Number(repeatFrequency),
            nextDate: format(nextDate, "yyyy-MM-dd"),
            size,
            reminderDate: remindDate ? remindDate.toISOString() : undefined,
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
                                    onValueChange={setShowRemindField}
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
