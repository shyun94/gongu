import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useListCalendars } from "./useListCalendars";
import { useListEvents } from "./useListEvents";
import { Button } from "@/components/ui/button";
import { CreateEventDialog } from "./CreateEventDialog";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  setHours,
  setMinutes,
} from "date-fns";
import { ko } from "date-fns/locale";

type Calendar = {
  id: string;
  name: string;
  color: string;
};

type Event = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  calendarId: string;
};

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [savedTimeRange, setSavedTimeRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const { data: calendars, isLoading: calendarsLoading } = useListCalendars();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const { data: events, isLoading: eventsLoading } = useListEvents({
    startDate: monthStart,
    endDate: monthEnd,
  });

  // 월의 모든 날짜 가져오기 (이전 달과 다음 달 포함하여 완전한 주 단위로)
  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    // 시작일의 요일 (0=일요일)
    const startDay = start.getDay();

    // 끝일의 요일
    const endDay = end.getDay();

    // 그리드를 채우기 위해 이전 달의 날짜 추가
    const daysInMonth = eachDayOfInterval({ start, end });
    const previousMonthDays = Array.from({ length: startDay }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() - startDay + i);
      return date;
    });

    // 그리드를 채우기 위해 다음 달의 날짜 추가
    const nextMonthDays = Array.from({ length: 6 - endDay }, (_, i) => {
      const date = new Date(end);
      date.setDate(date.getDate() + i + 1);
      return date;
    });

    return [...previousMonthDays, ...daysInMonth, ...nextMonthDays];
  }, [currentDate]);

  // 날짜별 이벤트 그룹화
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {};

    if (events) {
      events.forEach((event) => {
        const eventDate = new Date(event.startTime);
        const dateKey = format(eventDate, "yyyy-MM-dd");

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(event);
      });
    }

    return grouped;
  }, [events]);

  // 캘린더 ID로 캘린더 찾기
  const getCalendar = (calendarId: string): Calendar | undefined => {
    return calendars?.find((cal) => cal.id === calendarId);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (day: Date) => {
    // 클릭한 날짜의 9시부터 10시까지 기본 설정
    const startDate = setHours(setMinutes(day, 0), 9);
    const endDate = setHours(setMinutes(day, 0), 10);

    // 시간 범위 저장
    setSavedTimeRange({ start: startDate, end: endDate });

    // 다이얼로그 열기
    setSelectedEvent(null);
    setDialogOpen(true);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation(); // 날짜 클릭 이벤트 방지
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  if (calendarsLoading || eventsLoading) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col">
      {/* 일정 추가/수정 다이얼로그 */}
      <CreateEventDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            // 다이얼로그가 닫힐 때 저장된 시간 범위 초기화
            setSavedTimeRange(null);
          }
        }}
        calendars={calendars || []}
        defaultStartTime={savedTimeRange?.start}
        defaultEndTime={savedTimeRange?.end}
        event={selectedEvent}
      />

      {/* 헤더 */}
      <div className="relative flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={goToPreviousMonth}
          aria-label="이전 달"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentDate, "yyyy년 M월", { locale: ko })}
        </h2>

        <Button
          variant="outline"
          size="icon-sm"
          onClick={goToNextMonth}
          aria-label="다음 달"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 캘린더 그리드 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-7 gap-1">
          {/* 요일 헤더 */}
          {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
            <div
              key={day}
              className={[
                "text-center text-sm font-medium py-2",
                idx === 0
                  ? "text-red-500"
                  : idx === 6
                  ? "text-blue-500"
                  : "text-gray-700",
              ].join(" ")}
            >
              {day}
            </div>
          ))}

          {/* 날짜 그리드 */}
          {days.map((day, idx) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            const dayOfWeek = day.getDay();

            return (
              <div
                key={idx}
                className={[
                  "min-h-24 border border-gray-200 rounded-lg p-2 flex flex-col cursor-pointer transition-colors",
                  !isCurrentMonth && "bg-gray-50",
                  "hover:bg-gray-100",
                ].join(" ")}
                onClick={() => handleDateClick(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={[
                      "text-sm",
                      isTodayDate
                        ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-semibold"
                        : isCurrentMonth
                        ? dayOfWeek === 0
                          ? "text-red-500"
                          : dayOfWeek === 6
                          ? "text-blue-500"
                          : "text-gray-900"
                        : "text-gray-400",
                    ].join(" ")}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* 이벤트 목록 */}
                <div className="flex-1 overflow-hidden space-y-1">
                  {dayEvents.slice(0, 3).map((event) => {
                    const calendar = getCalendar(event.calendarId);
                    return (
                      <div
                        key={event.id}
                        className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: calendar?.color
                            ? `${calendar.color}20`
                            : "#e5e7eb",
                          borderLeft: `3px solid ${
                            calendar?.color || "#9ca3af"
                          }`,
                        }}
                        title={event.title}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        {event.allDay ? (
                          <span className="font-medium">{event.title}</span>
                        ) : (
                          <>
                            <span className="text-gray-600">
                              {format(new Date(event.startTime), "HH:mm")}
                            </span>{" "}
                            <span className="font-medium">{event.title}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{dayEvents.length - 3}개 더보기
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
