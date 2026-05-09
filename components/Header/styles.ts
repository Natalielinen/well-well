import { StyleSheet, Dimensions } from "react-native";
import { radius, spacing } from "../../themes/colors";

export const styles = StyleSheet.create({
  header: {
    paddingTop: 48,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: spacing.sm,
    borderRadius: radius.lg,
  },
  dateButton: {
    padding: spacing.xs,
  },
  currentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    minWidth: 140,
    textAlign: 'center',
  },
});