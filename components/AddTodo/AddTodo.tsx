import { Modal, View, Text, TextInput, Switch } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { styles } from "../../styles";
import { useState } from "react";
import CustomButton from "../../ui/CustomButton/CustomButton";
import { colors } from "../../themes/colors";
import { sizeOptions } from "../../constants/todo";
import { TodoItem } from "../../types/todo";
import { format } from "date-fns";

type AddTodoProps = {
    showModal: boolean;
    closeModal: () => void;
    onAddTodo: (todo: TodoItem) => void;
};
export default function AddTodo({ showModal, closeModal, onAddTodo }: AddTodoProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isRepeat, setIsRepeat] = useState(false);
    const [repeatFrequency, setRepeatFrequency] = useState("");

    const [size, setSize] = useState(sizeOptions[0].value);

    const [error, setError] = useState({
        title: "",
        repeatFrequency: "",
    });

    const clearFields = () => {
        setTitle("");
        setDescription("");
        setIsRepeat(false);
        setRepeatFrequency("");
    };

    const clearErrors = () => {
        setError({
            title: "",
            repeatFrequency: "",
        });
    };

    const onTitleChange = (text: string) => {
        setTitle(text);
        setError({
            ...error,
            title: "",
        });
    };

    const onRepeatFrequencyChange = (value: string) => {
        setRepeatFrequency(value);
        setError({
            ...error,
            repeatFrequency: "",
        });
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
        const newTask: TodoItem = {
            id: Date.now(),
            title,
            description,
            lastUpdated: new Date().toLocaleDateString(),
            isRepeat,
            repeatFrequency: Number(repeatFrequency),
            nextDate: format(new Date(), "yyyy-MM-dd"),
            size,
            isExpired: false
        }

        onAddTodo(newTask);
        clearFields();
        closeModal();
    }

    const onModalClose = () => {
        clearFields();
        closeModal();
        clearErrors();
    }
    return (
        <Modal
            visible={showModal}
            onRequestClose={closeModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View>
                <Text style={styles.addModalTitle}>Добавить дело</Text>

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
                            true: colors.primary
                        }}
                        thumbColor={colors.primaryDark}
                    />
                </View>

                {
                    isRepeat && (
                        <TextInput
                            style={styles.input}
                            value={repeatFrequency}
                            onChangeText={onRepeatFrequencyChange}
                            placeholder="Как часто повторять? (в днях)"
                            autoCapitalize="none"
                            keyboardType="numeric"
                        />

                    )
                }
                {
                    isRepeat && error.repeatFrequency && <Text style={styles.error}>{error.repeatFrequency}</Text>
                }

                <Text style={styles.pickerLabel}>Размер дела? (как долго делать?)</Text>
                <Picker
                    selectedValue={size}
                    onValueChange={(itemValue) => setSize(itemValue)}
                >
                    {sizeOptions.map((option) => (
                        <Picker.Item key={option.value} label={option.label} value={option.value} />
                    ))}
                </Picker>


                <View style={styles.addModalButtons}>
                    <CustomButton text="ЗАКРЫТЬ" onClick={onModalClose} />
                    <CustomButton text="СОХРАНИТЬ" onClick={onCreate} />
                </View>
            </View>
        </Modal>
    );
}
