import {
    Modal,
    View,
    Text,
    TextInput,
    Switch,
    Platform,
    Pressable,
    KeyboardAvoidingView,
    ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { styles } from "../../styles";
import { useEffect, useState } from "react";
import CustomButton from "../../ui/CustomButton/CustomButton";
import { colors } from "../../themes/colors";
import { sizeOptions } from "../../constants/todo";
import { TodoItem } from "../../types/todo";
import { format, isBefore, startOfDay } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ru } from "date-fns/locale";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { SafeAreaView } from "react-native-safe-area-context";

type AddTodoProps = {
    showModal: boolean;
    closeModal: () => void;
    onAddTodo: (todo: TodoItem) => void;
    onUpdateTodo: (id: number, todo: TodoItem) => void;
    editData: TodoItem | null;
    setEditData: (todo: TodoItem | null) => void;
};
export default function AddTodo({
    showModal,
    editData = null,
    closeModal,
    onAddTodo,
    onUpdateTodo,
    setEditData,
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

    const onTitleChange = (text: string) => {
        setTitle(text);
        setError({
            ...error,
            title: "",
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

    const onRepeatFrequencyChange = (value: string) => {
        setRepeatFrequency(value);
        setError({
            ...error,
            repeatFrequency: "",
        });
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
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={40}
                >
                    <ScrollView keyboardShouldPersistTaps="handled">
                        <Text style={styles.addModalTitle}>
                            {editData ? "Изменить дело" : "Добавить дело"}
                        </Text>

                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={onTitleChange}
                            placeholder="Название"
                            autoCapitalize="none"
                        />
                        {error.title && <Text style={styles.error}>{error.title}</Text>}

                        <TextInput
                            style={[styles.input, styles.multiline]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Описание"
                            autoCapitalize="none"
                            multiline
                        />

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Повторяющееся дело?</Text>
                            <Switch
                                value={isRepeat}
                                onValueChange={setIsRepeat}
                                trackColor={{
                                    true: colors.primary,
                                }}
                                thumbColor={colors.primaryDark}
                            />
                        </View>

                        {isRepeat && (
                            <TextInput
                                style={styles.input}
                                value={repeatFrequency}
                                onChangeText={onRepeatFrequencyChange}
                                placeholder="Как часто повторять? (в днях)"
                                autoCapitalize="none"
                                keyboardType="numeric"
                            />
                        )}
                        {isRepeat && error.repeatFrequency && (
                            <Text style={styles.error}>{error.repeatFrequency}</Text>
                        )}

                        <Text style={styles.pickerLabel}>
                            Размер дела? (как долго делать?)
                        </Text>
                        <Picker
                            selectedValue={size}
                            onValueChange={(itemValue) => setSize(itemValue)}
                        >
                            {sizeOptions.map((option) => (
                                <Picker.Item
                                    key={option.value}
                                    label={option.label}
                                    value={option.value}
                                />
                            ))}
                        </Picker>

                        <View style={styles.datePickerContainer}>
                            <Text style={styles.pickerLabel}>Дата выполнения</Text>
                            <Pressable
                                style={styles.datePicker}
                                onPress={() => setShowDatepicker(true)}
                            >
                                <Text>{format(nextDate, "d LLL yyyy", { locale: ru })}</Text>
                                <EvilIcons name="calendar" size={24} color="black" />
                            </Pressable>

                            {showDatepicker && (
                                <DateTimePicker
                                    value={nextDate}
                                    mode="date"
                                    display="default"
                                    onChange={onNextDateChange}
                                    minimumDate={new Date()}
                                />
                            )}
                            {error.minDate && <Text style={styles.error}>{error.minDate}</Text>}
                        </View>

                        <View style={styles.addModalButtons}>
                            <CustomButton text="ЗАКРЫТЬ" onClick={onModalClose} />
                            <CustomButton text="СОХРАНИТЬ" onClick={onCreate} />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}
