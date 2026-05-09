import { View, Text, TouchableOpacity } from "react-native"
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from "./styles"
import { colors } from "../../themes/colors";
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react-native';

interface HeaderProps {
    onShowAll: () => void;
    currentDate: Date;
    onPrevDate: () => void;
    onNextDate: () => void;
}

export default function Header({ currentDate, onPrevDate, onNextDate, onShowAll }: HeaderProps) {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };
    return (
        <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
        >
            <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>Мои дела</Text>
                <TouchableOpacity style={styles.iconButton} onPress={onShowAll} activeOpacity={0.7}>
                    <Menu color="white" size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.dateNav}>
                <TouchableOpacity onPress={onPrevDate} style={styles.dateButton}>
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <Text style={styles.currentDate}>{formatDate(currentDate)}</Text>
                <TouchableOpacity onPress={onNextDate} style={styles.dateButton}>
                    <ChevronRight color="white" size={24} />
                </TouchableOpacity>
            </View>
        </LinearGradient>

    )
};
