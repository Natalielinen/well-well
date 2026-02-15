import { Modal, View, Text, TextInput, Switch } from "react-native";
import { styles } from "../../styles";
import { useState } from "react";
import CustomButton from "../../ui/CustomButton/CustomButton";
import { colors } from "../../themes/colors";

type AddTodoProps = {
    showModal: boolean;
    closeModal: () => void;
};
export default function AddTodo({ showModal, closeModal }: AddTodoProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isRepeat, setIsRepeat] = useState(false);
    const [repeatFrequency, setRepeatFrequency] = useState("");

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
        const newTask = {
            id: Date.now(),
            title,
            description,
            lastUpdated: new Date().toLocaleDateString(),
            isRepeat,
            repeatFrequency,
            nextDate: new Date().toLocaleDateString(),
            size: 1, // заменить
            isExpired: false
        }

        console.log(newTask);
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


                <View style={styles.addModalButtons}>
                    <CustomButton text="ЗАКРЫТЬ" onClick={onModalClose} />
                    <CustomButton text="СОХРАНИТЬ" onClick={onCreate} />
                </View>
            </View>
        </Modal>
    );
}
