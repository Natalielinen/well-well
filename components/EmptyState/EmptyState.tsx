import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

export default function EmptyState() {
    return (
        <View style={styles.container}>
            <View style={styles.illustration}>
                <View style={styles.circle}>
                    <View style={styles.document}>
                        <View style={styles.line} />
                        <View style={styles.line} />
                        <View style={[styles.line, { width: '60%' }]} />
                    </View>
                    <View style={styles.checkCircle}>
                        <View style={styles.check} />
                    </View>
                </View>
            </View>
            <Text style={styles.title}>На сегодня задач нет</Text>
            <Text style={styles.subtitle}>
                Нажмите на кнопку “+”, чтобы создать первое дело и начать продуктивный день!
            </Text>
        </View>
    );
}