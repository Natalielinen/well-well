import { addDays, format } from "date-fns";
import { parseTime, formatTime } from "./time";

/**
 * Вычисляет следующую дату повторения задачи по базовой дате и частоте
 * повторения (в днях). Это единственное место, где происходит сдвиг на
 * repeatFrequency — вызывающий код (например, rescheduleNextNotification)
 * НЕ должен прибавлять repeatFrequency повторно, иначе воспроизводится баг
 * двойного сдвига (см. .planning/debug/recurring-notification-stops-after-complete.md).
 */
export function nextRecurrenceDate(base: Date, repeatFrequency: number): string {
    return format(addDays(base, repeatFrequency), "yyyy-MM-dd");
}

/**
 * Переносит время суток из текущего reminderDate на новую nextDate и
 * возвращает результат в ISO-формате (toISOString()), как того требует
 * контракт rescheduleNextNotification. Возвращает undefined, если
 * currentReminderDate отсутствует (у задачи нет напоминания).
 */
export function nextReminderIso(
    nextDate: string,
    currentReminderDate?: string,
): string | undefined {
    if (!currentReminderDate) {
        return undefined;
    }

    const reminderTime = formatTime(new Date(currentReminderDate));
    const finalDateTime = new Date(nextDate);
    const parsed = parseTime(reminderTime);
    if (parsed) {
        finalDateTime.setHours(parsed.getHours());
        finalDateTime.setMinutes(parsed.getMinutes());
    }

    return finalDateTime.toISOString();
}
