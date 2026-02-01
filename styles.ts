import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "#EFD9F6",
  },
  appHeader: {
    width: "100%",
    height: 50,
    backgroundColor: "#9C51B6",
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  appScrollableContainer: {
    width: "100%",
    alignItems: "center",
    rowGap: 24,
    justifyContent: "flex-start",
    paddingTop: 16,
    paddingBottom: 52,
  },
  todoItem: {
    padding: 16,
    width: "95%",
    height: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  todoDescription: {
    fontSize: 14,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9C51B6",
  }
});
