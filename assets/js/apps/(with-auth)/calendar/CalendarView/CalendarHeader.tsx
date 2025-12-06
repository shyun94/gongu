import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ko } from "date-fns/locale";
import { format } from "date-fns";

interface Props {
  currentDate: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

export const CalendarHeader = ({
  currentDate,
  goToPreviousMonth,
  goToNextMonth,
}: Props) => {
  return (
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
  );
};
