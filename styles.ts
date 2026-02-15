import { StyleSheet, Dimensions } from "react-native";
import { colors } from "./themes/colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  appContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  appHeader: {
    width: "100%",
    height: "6%",
    backgroundColor: colors.background,
    //marginTop: 50,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  date: {
    width: "100%",
    padding: "1%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "1%"
  },
  dateText: {
    fontSize: windowWidth > 500 ? 32 : 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  appScrollableContainer: {
    rowGap: 24,
    paddingTop: 16,
    paddingBottom: "4%",
  },
  todoItem: {
    padding: 12,
    width: "95%",
    height: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)",
    alignSelf: "center",
  },
  expiredItem: {
    backgroundColor: "#d65f5f7c",
  },
  todoTitle: {
    fontSize: windowWidth > 500 ? 36 : 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  todoDescription: {
    marginTop: 4,
    fontSize: windowWidth > 500 ? 26 : 13,
    color: colors.textSecondary,
  },
  emptyListText: {
    fontSize: windowWidth > 500 ? 36 : 18,
    fontWeight: "600",
    color: colors.textPrimary,
    alignSelf: "center",
  },
  customButton: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.background,
    
  },
  ghost: {
    backgroundColor: "transparent",
    boxShadow: "none",
  },
  customButtonText: {
    fontSize: windowWidth > 500 ? 36 :18,
    fontWeight: "bold",
    color: colors.textPrimary,
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
    color: colors.textPrimary,
    alignSelf: "center",
  },
  addModalTitle: {
    fontSize: windowWidth > 500 ? 36 : 18,
    fontWeight: "600",
    color: colors.textPrimary,
    alignSelf: "center",
    padding: 12
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
    columnGap: 12
  },
  switchLabel: {
    fontSize: 16

  },
  addModalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    columnGap: 12,
    padding: 12
  },
  error: {
    color: "red",
    marginLeft: 12,
  }
});
