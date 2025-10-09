import React, { useMemo } from "react";
import { Transaction } from "./types";
import { Dayjs } from "dayjs";

interface DayProps {
  date: Dayjs;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  transactions: Transaction[];
  onSelect: (date: Dayjs) => void;
}

export const Day: React.FC<DayProps> = ({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  transactions,
  onSelect,
}) => {
  const dayNumber = date.date();

  const { totalIncome, totalExpense } = useMemo(
    () => ({
      totalIncome: calcTotalIncome(transactions),
      totalExpense: calcTotalExpense(transactions),
    }),
    [transactions]
  );

  const handleClick = () => {
    onSelect(date);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex-1 h-14 flex flex-col items-center justify-start p-1 mx-0.5 my-0.5 rounded-md
        transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${
          isSelected
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-transparent"
        }
        ${isToday && !isSelected ? "border border-blue-400" : ""}
        ${!isCurrentMonth ? "opacity-50" : ""}
      `}
      aria-label={`${date.format("YYYY년 MM월 DD일")} 선택`}
    >
      {/* 날짜 */}
      <span
        className={`
          text-sm mb-1
          ${
            isToday && !isSelected
              ? "font-semibold text-blue-600"
              : "font-normal"
          }
          ${
            !isCurrentMonth
              ? "text-gray-300"
              : isSelected
              ? "text-white"
              : isToday
              ? "text-blue-600"
              : "text-gray-900"
          }
        `}
      >
        {dayNumber}
      </span>

      {/* 수입과 지출 표시 */}
      {(totalIncome > 0 || totalExpense > 0) && (
        <div className="flex flex-col items-start justify-start gap-0.5">
          {totalIncome > 0 && (
            <span
              className={`
                font-bold truncate
                text-xs
                ${isSelected ? "text-white" : "text-blue-600"}
              `}
              style={{ fontSize: Math.max(calcFontSize(totalIncome) - 1, 6) }}
            >
              +{totalIncome.toLocaleString()}
            </span>
          )}
          {totalExpense > 0 && (
            <span
              className={`
                font-bold truncate
                text-xs
                ${isSelected ? "text-white" : "text-red-600"}
              `}
              style={{ fontSize: Math.max(calcFontSize(totalExpense) - 1, 6) }}
            >
              -{totalExpense.toLocaleString()}
            </span>
          )}
        </div>
      )}
    </button>
  );
};

const calcTotalIncome = (transactions: Transaction[]): number =>
  transactions.reduce(
    (acc, transaction) =>
      acc + (transaction.type === "income" ? transaction.amount : 0),
    0
  );

const calcTotalExpense = (transactions: Transaction[]): number =>
  transactions.reduce(
    (acc, transaction) =>
      acc + (transaction.type === "expense" ? transaction.amount : 0),
    0
  );

const calcFontSize = (amount: number): number => {
  if (amount > 9999999) {
    return 6;
  } else if (amount > 999999) {
    return 7;
  } else {
    return 8;
  }
};
