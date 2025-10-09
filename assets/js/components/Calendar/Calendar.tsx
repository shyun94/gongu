import React, { useState, useCallback } from "react";
import { Transaction } from "./types";
import { TMonth } from "./types";
import dayjs, { Dayjs } from "dayjs";
import Month from "./Month";

interface CalendarProps {
  transactions: Transaction[];
}

export function Calendar({ transactions }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<TMonth>(
    dayjs().format("YYYY-MM")
  );
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const handleDateSelect = useCallback(
    (date: Dayjs) => {
      const selectedMonth = date.format("YYYY-MM");
      if (selectedMonth !== currentMonth) {
        setCurrentMonth(selectedMonth as TMonth);
      }
      setSelectedDate(date);
    },
    [currentMonth]
  );

  const handlePrevMonth = useCallback(() => {
    const prevMonth = dayjs(currentMonth)
      .subtract(1, "month")
      .format("YYYY-MM");
    setCurrentMonth(prevMonth as TMonth);
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    const nextMonth = dayjs(currentMonth).add(1, "month").format("YYYY-MM");
    setCurrentMonth(nextMonth as TMonth);
  }, [currentMonth]);

  return (
    <div className="w-full h-full bg-white">
      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="이전 달"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-gray-900">
          {dayjs(currentMonth).format("YYYY년 MM월")}
        </h2>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="다음 달"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* 캘린더 본체 */}
      <div className="p-2">
        <Month
          month={currentMonth}
          transactions={transactions}
          selectedDate={selectedDate}
          onSelect={handleDateSelect}
        />
      </div>
    </div>
  );
}
