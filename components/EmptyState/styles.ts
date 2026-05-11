import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../themes/colors';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: spacing.md,
  },
  illustration: {
    marginBottom: spacing.lg,
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  document: {
    width: 70,
    height: 90,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    padding: 12,
    justifyContent: 'center',
    gap: 8,
  },
  line: {
    height: 3,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    width: '100%',
  },
  checkCircle: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    width: 16,
    height: 8,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary,
    transform: [{ rotate: '-45deg' }],
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
});