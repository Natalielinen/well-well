import {
    Modal,
    View,
    Text,
    TextInput,
    Switch,
    Platform,
    TouchableOpacity,
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
        }
    }, [editData]);

    const clearFields = () => {
        setTitle("");
        setDescription("");
        setIsRepeat(false);
        setRepeatFrequency("");
        setSize(sizeOptions[0].value);
        setNextDate(new Date());
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

    const onModalClose = () => {
        clearFields();
        closeModal();
        clearErrors();
        setEditData(null);
    };

    const onCreate = () => {
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

        const newTask = {
            id: editData ? editData.id : Date.now(),
            title,
            description,
            lastUpdated: format(new Date(), "yyyy-MM-dd"),
            isRepeat,
            repeatFrequency: Number(repeatFrequency),
            nextDate: format(nextDate, "yyyy-MM-dd"),
            size,
        };
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
            <View style={styles.container}>
                <View style={styles.handle} />
                <Text style={styles.title}>Добавить дело</Text>

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
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.btnSecondary} onPress={onModalClose}>
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
        </Modal>
    );
}
