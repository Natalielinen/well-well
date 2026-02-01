import { Pressable, View, Text } from "react-native";
import { styles } from "../../styles";

export default function AddButton() {

    const onAddItem = () => {
        console.log("pressed")
    }

    return (
        <Pressable onPress={onAddItem}>
            <View style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
            </View>
        </Pressable>
    )
}