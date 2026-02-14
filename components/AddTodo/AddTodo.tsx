import { Modal, View, Text, TextInput, Button } from "react-native";
import { styles } from "../../styles";
import { useState } from "react";
import CustomButton from "../../ui/CustomButton/CustomButton";

type AddTodoProps = {
    showModal: boolean;
    closeModal: () => void;
};
export default function AddTodo({ showModal, closeModal }: AddTodoProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const onModalClose = () => {
        setTitle("");
        setDescription("");
        closeModal();
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
                    onChangeText={setTitle}
                    placeholder="Название"
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Описание"
                    autoCapitalize="none"
                />

                <View style={styles.addModalButtons}>
                    <CustomButton text="ЗАКРЫТЬ" onClick={onModalClose} />
                    <CustomButton text="СОХРАНИТЬ" onClick={() => console.log(title, description)} />
                </View>
            </View>
        </Modal>
    );
}
