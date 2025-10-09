import React, { useMemo } from "react";
import { Week } from "./Week";
import { Transaction, TMonth, TWeek } from "./types";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";

type Props = {
  month: TMonth;
  transactions: Transaction[];
  selectedDate: Dayjs;
  onSelect: (date: Dayjs) => void;
};

const weekDays = ["일", "월", "화", "수", "목", "금", "토"] as const;

const getDateKey = (date: Dayjs): string => dayjs(date).format("YYYY-MM-DD");

function Month({ month, transactions, selectedDate, onSelect }: Props) {
  const today = useMemo(() => dayjs(), []);

  const weeks = useMemo(() => generateWeeksForMonth(month), [month]);

  const transactionsByDate = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      const key = getDateKey(transaction.date);
      acc[key] = [...(acc[key] || []), transaction];
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [transactions]);

  const weekTransactions = useMemo(() => {
    return weeks.map((week) => {
      const weekKey = week.map(getDateKey).join("-");
      const weekTxs = week.flatMap(
        (date) => transactionsByDate[getDateKey(date)] || []
      );
      return [weekKey, weekTxs] as const;
    });
  }, [weeks, transactionsByDate]);

  return (
    <div className="w-full px-2">
      {/* 요일 헤더 */}
      <div className="flex pb-2 px-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="flex-1 flex items-center justify-center pl-2"
          >
            <span className="text-sm font-medium text-gray-600">{day}</span>
          </div>
        ))}
      </div>

      {/* 주별 캘린더 */}
      <div className="space-y-1 pb-4">
        {weeks.map((dates, idx) => (
          <Week
            key={weekTransactions[idx][0]}
            dates={dates}
            currentMonth={month}
            today={today}
            selectedDate={selectedDate}
            transactions={weekTransactions[idx][1]}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

export default Month;

const generateWeeksForMonth = (monthDate: TMonth): TWeek[] => {
  const baseDate = dayjs(monthDate);

  const firstDay = baseDate.startOf("month");
  const startDate = firstDay.subtract(firstDay.day(), "day");

  const totalWeeks = Math.ceil((firstDay.day() + baseDate.daysInMonth()) / 7);

  const weeks: TWeek[] = [];
  for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
    const week: Dayjs[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      week.push(startDate.add(weekIndex * 7 + dayIndex, "day"));
    }
    weeks.push(week);
  }

  return weeks;
};
