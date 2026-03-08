import { Pressable, View, Text } from "react-native";
import { styles } from "../../styles";
import { ButtonVariant } from "../../types/ui";
import { ReactNode } from "react";

type CustomButtonProps = {
    onClick: () => void;
    text: string | ReactNode;
    variant?: ButtonVariant;
    disabled?: boolean;
};
export default function CustomButton({
    onClick,
    text,
    variant = "primary",
    disabled = false,
}: CustomButtonProps) {
    return (
        <Pressable onPress={onClick} disabled={disabled}>
            <View style={[styles.customButton, styles[variant], disabled && styles.disabled]}>
                <Text style={styles.customButtonText}>{text}</Text>
            </View>
        </Pressable>
    );
}
