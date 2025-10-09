import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { Transaction } from "./types";
import { TMonth } from "./types";
import dayjs, { Dayjs } from "dayjs";
import Month from "./Month";
import { Link } from "@tanstack/react-router";
import useTripleSlider from "./useTripleSlider";

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
    slideIndex,
    trackStyle,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTransitionEnd,
    goPrev,
    goNext,
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

  const handlePrevMonth = useCallback(() => {
    goPrev();
  }, [goPrev]);

  const handleNextMonth = useCallback(() => {
    goNext();
  }, [goNext]);

  // 리사이즈/마우스 리브 처리 및 제스처 로직은 훅 내부에서 관리

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
          <button
            aria-label="설정"
            className="w-9 h-9 grid place-items-center rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none"
          >
            {/* 톱니바퀴 아이콘 */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-5 h-5 text-gray-700"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.57-.904 3.31.835 2.406 2.406a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.904 1.57-.835 3.31-2.406 2.406a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.57.904-3.31-.835-2.406-2.406a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.904-1.57.835-3.31 2.406-2.406.9.519 2.04.06 2.573-1.066z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="sr-only">설정</span>
          </button>
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
