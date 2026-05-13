import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { TodoItem } from "../../types/todo";
import { styles } from "./styles";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface WeekStripProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    tasks: TodoItem[];
}

export default function WeekStrip({
    selectedDate,
    onSelectDate,
    tasks,
}: WeekStripProps) {
    const today = new Date();
    // Сбрасываем время для корректного сравнения дат
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const hasTasksOnDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        return tasks.some((t) => {
            const taskDate = new Date(t.nextDate).toISOString().split("T")[0];
            return taskDate === dateStr;
        });
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.toDateString() === d2.toDateString();
    };

    return (
        <View style={styles.container}>
            {Array.from({ length: 7 }, (_, i) => {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                date.setHours(0, 0, 0, 0);

                const isActive = isSameDay(date, selectedDate);
                const hasTasks = hasTasksOnDate(date);
                const isToday = isSameDay(date, today);
                const isDisabled = date < today;

                return (
                    <TouchableOpacity
                        key={i}
                        style={[
                            styles.dayPill,
                            isActive && styles.dayPillActive,
                            isDisabled && styles.dayPillDisabled,
                        ]}
                        onPress={() => !isDisabled && onSelectDate(date)}
                        activeOpacity={isDisabled ? 1 : 0.7}
                        disabled={isDisabled}
                    >
                        <Text
                            style={[
                                styles.dayName,
                                isActive && styles.dayTextActive,
                                isDisabled && styles.dayTextDisabled,
                            ]}
                        >
                            {DAYS[i]}
                        </Text>
                        <Text
                            style={[
                                styles.dayNum,
                                isActive && styles.dayTextActive,
                                isToday && !isActive && styles.todayText,
                                isDisabled && styles.dayTextDisabled,
                            ]}
                        >
                            {date.getDate()}
                        </Text>
                        {hasTasks && !isActive && !isDisabled && (
                            <View style={styles.dot} />
                        )}
                        {isActive && <View style={[styles.dot, styles.dotActive]} />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}