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
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

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
                const isActive = isSameDay(date, selectedDate);
                const hasTasks = hasTasksOnDate(date);
                const isToday = isSameDay(date, today);

                return (
                    <TouchableOpacity
                        key={i}
                        style={[styles.dayPill, isActive && styles.dayPillActive]}
                        onPress={() => onSelectDate(date)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.dayName, isActive && styles.dayTextActive]}>
                            {DAYS[i]}
                        </Text>
                        <Text
                            style={[
                                styles.dayNum,
                                isActive && styles.dayTextActive,
                                isToday && !isActive && styles.todayText,
                            ]}
                        >
                            {date.getDate()}
                        </Text>
                        {hasTasks && !isActive && <View style={styles.dot} />}
                        {isActive && <View style={[styles.dot, styles.dotActive]} />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
