import { useState, useCallback, useMemo } from "react";
import { Transaction } from "./types";
import { TMonth } from "./types";
import dayjs, { Dayjs } from "dayjs";
import Month from "./Month";
import { Link } from "@tanstack/react-router";
import useTripleSlider from "./useTripleSlider";
import { Button } from "@/components/ui/Button";
import { SettingsIcon } from "lucide-react";

interface CalendarProps {
  transactions: Transaction[];
}

export function Calendar({ transactions }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<TMonth>(
    dayjs().format("YYYY-MM")
  );
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const {
    containerRef,
    isDragging,
    trackStyle,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTransitionEnd,
  } = useTripleSlider({
    minSwipeDistance: 80,
    maxDragDistance: 120,
    animationMs: 250,
  });

  const prevMonthStr = useMemo(
    () => dayjs(currentMonth).subtract(1, "month").format("YYYY-MM") as TMonth,
    [currentMonth]
  );
  const nextMonthStr = useMemo(
    () => dayjs(currentMonth).add(1, "month").format("YYYY-MM") as TMonth,
    [currentMonth]
  );

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

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-white overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* 캘린더 헤더 */}
      <div className="relative flex items-center justify-center p-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {dayjs(currentMonth).format("YYYY년 M월")}
        </h2>
        <Link
          to="/settings"
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <Button variant="ghost" size="icon">
            <SettingsIcon className="w-4 h-4" />
            <span className="sr-only">설정</span>
          </Button>
        </Link>
      </div>

      {/* 캘린더 본체: 이전/현재/다음 3개 뷰를 트랙에 렌더링 */}
      <div
        className={`relative w-full h-full ${
          isDragging.current ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div
          className="flex h-full will-change-transform"
          style={trackStyle}
          onTransitionEnd={() =>
            handleTransitionEnd((direction) => {
              if (direction === 1) setCurrentMonth(nextMonthStr);
              else if (direction === -1) setCurrentMonth(prevMonthStr);
            })
          }
        >
          <div className="min-w-full shrink-0">
            <div className="p-2">
              <Month
                month={prevMonthStr}
                transactions={transactions}
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
              />
            </div>
          </div>
          <div className="min-w-full shrink-0">
            <div className="p-2">
              <Month
                month={currentMonth}
                transactions={transactions}
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
              />
            </div>
          </div>
          <div className="min-w-full shrink-0">
            <div className="p-2">
              <Month
                month={nextMonthStr}
                transactions={transactions}
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
