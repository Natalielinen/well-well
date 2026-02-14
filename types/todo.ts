export type TodoItem = {
    id: number;
    title: string;
    description: string;
    lastUpdated: string; // Дата последнего выполнения
    isRepeat: boolean;
    repeatFrequency: number; // В днях
    nextDate: string; // Дата следующего выполнения Или дата начала, если нет даты последнего выполнения (новая задача)
    size: number;
    isExpired: boolean;
    
}

/*

Размеры:

Фибоначчи
1 — 15 — 30 мин
3 — 30 - 60мин
5 — 1 ч — 2 ч
8 — 2ч -3 ч
13 — больше 3 ч

Вых — 13 б
Будни — 5 б


*/