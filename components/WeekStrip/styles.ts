import {  StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing } from '../../themes/colors';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    dayPill: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: 10,
        borderRadius: radius.md,
        minWidth: 44,
    },
    dayPillActive: {
        backgroundColor: colors.primary,
        ...shadows.md,
    },
    dayName: {
        fontSize: 11,
        textTransform: 'uppercase',
        color: colors.textMuted,
        marginBottom: 4,
    },
    dayNum: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    dayTextActive: {
        color: 'white',
    },
    todayText: {
        color: colors.primary,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.primary,
        marginTop: 4,
    },
    dotActive: {
        backgroundColor: 'white',
    },
});