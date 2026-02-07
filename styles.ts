import { StyleSheet, Dimensions } from "react-native";
import { colors } from "./themes/colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#EFD9F6",
  },
  appContainer: {
    flex: 1,
    backgroundColor: "#EFD9F6",
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
    width: "100%",
    alignItems: "center",
    rowGap: 24,
    justifyContent: "flex-start",
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
  customButton: {
    width: windowWidth > 500 ? 80 : 40,
    height: windowWidth > 500 ? 80 : 40,
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.25)",
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
  }
});
