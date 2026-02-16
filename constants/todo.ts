import { SizeItem, SizeOption } from "../types/todo";

export const sizes: SizeItem = {
    1: {
        time: "15 - 30 мин",
        color: "#02c72c",
        lineWidth: 20
    },
    3: {
        time: "30 - 60 мин",
        color: "#ffcc00",
        lineWidth: 50
    },
    5: {
        time: "1 ч - 2 ч",
        color: "#ff7b00",
        lineWidth: 80
    },
    8: {
        time: "2 ч - 3 ч",
        color: "#ff0800",
        lineWidth: 110
    },
    13: {
        time: "больше 3 ч",
        color: "#5f0101",
        lineWidth: 140
    }
};

export const sizeOptions: SizeOption[] = [
    { label: "15 - 30 мин", value: 1 },
    { label: "30 - 60 мин", value: 3 },
    { label: "1 ч - 2 ч", value: 5 },
    { label: "2 ч - 3 ч", value: 8 },
    { label: "больше 3 ч", value: 13 },
]