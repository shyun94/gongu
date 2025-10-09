import React, { useMemo } from "react";
import { Day } from "./Day";
import { Transaction, TMonth, TWeek } from "./types";
import { Dayjs } from "dayjs";

const getDateKey = (date: Dayjs): string => date.format("YYYY-MM-DD");

interface WeekProps {
  dates: TWeek;
  currentMonth: TMonth;
  today: Dayjs;
  selectedDate: Dayjs;
  transactions: Transaction[];
  onSelect: (date: Dayjs) => void;
}

export const Week: React.FC<WeekProps> = ({
  dates,
  currentMonth,
  today,
  selectedDate,
  transactions,
  onSelect,
}) => {
  const transactionsByDate = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      const key = getDateKey(transaction.date);
      acc[key] = [...(acc[key] || []), transaction];
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [transactions]);

  const daysWithMetadata = useMemo(
    () =>
      dates.map((day) => ({
        key: getDateKey(day),
        date: day,
        isCurrentMonth: day.isSame(currentMonth, "month"),
        isToday: day.isSame(today, "day"),
        isSelected: day.isSame(selectedDate, "day"),
        transactions: transactionsByDate[getDateKey(day)] || [],
      })),
    [dates, currentMonth, today, selectedDate, transactionsByDate]
  );

  return (
    <div className="flex">
      {daysWithMetadata.map(
        ({ key, date, isCurrentMonth, isToday, isSelected, transactions }) => (
          <Day
            key={key}
            date={date}
            isCurrentMonth={isCurrentMonth}
            isToday={isToday}
            isSelected={isSelected}
            transactions={transactions}
            onSelect={onSelect}
          />
        )
      )}
    </div>
  );
};
