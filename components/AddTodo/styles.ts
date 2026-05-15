import { StyleSheet, Platform } from "react-native";
import { colors, radius, shadows, spacing } from "../../themes/colors";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.md,
    paddingBottom: Platform.OS === "ios" ? 40 : spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.lg,
    color: colors.text,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  selectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  selectOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  selectTextActive: {
    color: "white",
  },
  priorityRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  priorityBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  dateButton: {
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  btnSecondary: {
    flex: 1,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    alignItems: "center",
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  btnPrimary: {
    flex: 1,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    ...shadows.md,
  },
  btnPrimaryDisabled: {
    opacity: 0.5,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
