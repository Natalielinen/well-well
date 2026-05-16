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

  appScrollableContainer: {
    rowGap: 16,
    paddingTop: 16,
    paddingBottom: "4%",
    paddingHorizontal: 8,

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
    color: colors.text,
    alignSelf: "center",

  }

});
