import { StyleSheet, Dimensions } from "react-native";
import { colors, radius, shadows, spacing } from "./themes/colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export const styles = StyleSheet.create({
  //new
 container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  taskList: {
    gap: spacing.sm,
  },
  allTasksBanner: {
    backgroundColor: colors.primaryGhost,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  allTasksText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  fab: {
    position: 'absolute',
    bottom: 36,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  sheetBackground: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  sheetHandle: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  sheetContent: {
    flex: 1,
  },

  // old
  safeContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  appContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  appHeader: {
    width: "100%",
    height: "7%",
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  date: {
    width: "100%",
    padding: "1%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "1%",
  },
  pickerItem: {
    fontSize: windowWidth > 500 ? 32 : 16,
    fontWeight: "600",
    color: colors.primary,
  },
  dateText: {
    fontSize: windowWidth > 500 ? 32 : 16,
    fontWeight: "600",
    color: colors.primary,
  },
  appScrollableContainer: {
    rowGap: 16,
    paddingTop: 16,
    paddingBottom: "4%",
    paddingHorizontal: 8,
  },
  todoItem: {
    padding: 12,
    width: "95%",
    minHeight: 110,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)",
    alignSelf: "center",
  },
  expiredItem: {
    backgroundColor: "#e7a0a0",
  },
  todoRepeat: {
    color: colors.textSecondary,
    fontSize: windowWidth > 500 ? 26 : 13,
  },
  todoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    
  },
  todoTitle: {
    fontSize: windowWidth > 500 ? 36 : 18,
    fontWeight: "600",
    color: colors.primary,
    maxWidth: "73%"
  },
  todoDescription: {
    marginTop: 4,
    fontSize: windowWidth > 500 ? 26 : 13,
    color: colors.textSecondary,
  },
  todoFooter: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
   paddingBottom: 6
  },
  todoFooterText: {
    fontSize: windowWidth > 500 ? 26 : 13,
    color: colors.textSecondary,
  },
  todoActions: {
    paddingTop: 24,
    paddingHorizontal: 12,
    marginTop: -12,
    zIndex: -1,
    width: "90%",
    height: 70,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 8,
    boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)",
    alignSelf: "center",
    columnGap: 12

  },
  emptyListText: {
    fontSize: windowWidth > 500 ? 36 : 18,
    fontWeight: "600",
    color: colors.primary,
    alignSelf: "center",
  },
  customButton: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)",
  },
  lg: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    
  },
  textlg: {
    fontSize: windowWidth > 500 ? 34 : 16,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textmd: {
    fontSize: windowWidth > 500 ? 32 : 14,
  },
   sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
   
  },
  textsm: {
    fontSize: windowWidth > 500 ? 30 : 12,
  },
     xs: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    
  },
  textxs: {
    fontSize: windowWidth > 500 ? 28 : 10,
  },
  disabled: {
    opacity: 0.5,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.bg,
  },
  outlinePrimary: {
    backgroundColor: colors.bg,
    borderWidth: 3,
    borderColor: colors.primaryDark,
  },
  ghost: {
    backgroundColor: "transparent",
    boxShadow: "none",
  },

  customButtonText: {
    fontSize: windowWidth > 500 ? 36 : 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  backToTopButton: {
    padding: 14,
    width: "95%",
    height: 50,
    backgroundColor: "#ffffff8f",
    borderRadius: 8,
    alignSelf: "center",
  },
  backToTopButtonText: {
    fontSize: windowWidth > 500 ? 36 : 18,
    fontWeight: "600",
    color: colors.bg,
    alignSelf: "center",
  },
  addModalTitle: {
    fontSize: windowWidth > 500 ? 36 : 18,
    fontWeight: "600",
    color: colors.primary,
    alignSelf: "center",
    padding: 12,
  },
  input: {
    height: 40,
    margin: 12,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  multiline: {
    height: 100,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    columnGap: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  pickerLabel: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "600",
  },
  datePickerContainer: {
    gap: 4,

  },
  datePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    margin: 12,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,

  },
  addModalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    columnGap: 12,
    padding: 12,
  },
  error: {
    color: "red",
    marginLeft: 12,
  },
});
