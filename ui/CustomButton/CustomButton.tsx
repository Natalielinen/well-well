import { Pressable, View, Text } from "react-native";
import { styles } from "../../styles";
import { ButtonVariant } from "../../components/Todo/types/ui";

type CustomButtonProps = {
    onClick: () => void;
    text: string;
    variant?: ButtonVariant;
};
export default function CustomButton({
    onClick,
    text,
    variant = "primary",
}: CustomButtonProps) {
    return (
        <Pressable onPress={onClick}>
            <View style={[styles.customButton, styles[variant]]}>
                <Text style={styles.customButtonText}>{text}</Text>
            </View>
        </Pressable>
    );
}
