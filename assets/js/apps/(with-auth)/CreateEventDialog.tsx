import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateEvent } from "./useCreateEvent";
import { useUpdateEvent } from "./useUpdateEvent";
import { format } from "date-fns";
import { toast } from "sonner";

const eventSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  description: z.string().optional(),
  startTime: z.string().min(1, "시작 시간을 입력하세요"),
  endTime: z.string().min(1, "종료 시간을 입력하세요"),
  allDay: z.boolean(),
  location: z.string().optional(),
  calendarId: z.string().min(1, "캘린더를 선택하세요"),
});

type EventFormValues = z.infer<typeof eventSchema>;

type Calendar = {
  id: string;
  name: string;
  color: string;
};

type Event = {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location?: string | null;
  calendarId: string;
};

type CreateEventDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendars: Calendar[];
  defaultStartTime?: Date;
  defaultEndTime?: Date;
  event?: Event | null;
};

export const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  open,
  onOpenChange,
  calendars,
  defaultStartTime,
  defaultEndTime,
  event,
}) => {
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      allDay: false,
      location: "",
      calendarId: calendars[0]?.id || "",
    },
  });

  const allDay = watch("allDay");

  useEffect(() => {
    if (open) {
      if (event) {
        // 수정 모드
        const startDate = new Date(event.startTime);
        const endDate = new Date(event.endTime);

        reset({
          title: event.title,
          description: event.description || "",
          startTime: event.allDay
            ? format(startDate, "yyyy-MM-dd")
            : format(startDate, "yyyy-MM-dd'T'HH:mm"),
          endTime: event.allDay
            ? format(endDate, "yyyy-MM-dd")
            : format(endDate, "yyyy-MM-dd'T'HH:mm"),
          allDay: event.allDay,
          location: event.location || "",
          calendarId: event.calendarId,
        });
      } else {
        // 생성 모드
        const startDate = defaultStartTime || new Date();
        const endDate =
          defaultEndTime || new Date(startDate.getTime() + 60 * 60 * 1000);

        reset({
          title: "",
          description: "",
          startTime: format(startDate, "yyyy-MM-dd'T'HH:mm"),
          endTime: format(endDate, "yyyy-MM-dd'T'HH:mm"),
          allDay: false,
          location: "",
          calendarId: calendars[0]?.id || "",
        });
      }
    }
  }, [open, event, defaultStartTime, defaultEndTime, calendars, reset]);

  const onSubmit = async (data: EventFormValues) => {
    try {
      // ISO 형식으로 변환
      const startTime = data.allDay
        ? new Date(data.startTime + "T00:00:00").toISOString()
        : new Date(data.startTime).toISOString();
      const endTime = data.allDay
        ? new Date(data.endTime + "T23:59:59").toISOString()
        : new Date(data.endTime).toISOString();

      if (event) {
        // 수정
        await updateEvent.mutateAsync({
          id: event.id,
          input: {
            title: data.title,
            description: data.description || null,
            startTime,
            endTime,
            allDay: data.allDay,
            location: data.location || null,
          },
        });
        toast.success("일정이 수정되었습니다");
      } else {
        // 생성
        await createEvent.mutateAsync({
          title: data.title,
          description: data.description || null,
          startTime,
          endTime,
          allDay: data.allDay || false,
          location: data.location || null,
          calendarId: data.calendarId,
        });
        toast.success("일정이 추가되었습니다");
      }

      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : event
          ? "일정 수정에 실패했습니다"
          : "일정 추가에 실패했습니다";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? "일정 수정" : "일정 추가"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="title" className="mb-2 block">
              제목
            </Label>
            <Input id="title" {...register("title")} placeholder="일정 제목" />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1.5">
                {errors.title.message}
              </p>
            )}
          </div>

          {!event && (
            <div>
              <Label htmlFor="calendarId" className="mb-2 block">
                캘린더
              </Label>
              <select
                id="calendarId"
                {...register("calendarId")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {calendars.map((cal) => (
                  <option key={cal.id} value={cal.id}>
                    {cal.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="allDay"
              {...register("allDay")}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="allDay" className="cursor-pointer mb-0">
              하루 종일
            </Label>
          </div>

          <div>
            <Label htmlFor="startTime" className="mb-2 block">
              시작
            </Label>
            <Input
              id="startTime"
              type={allDay ? "date" : "datetime-local"}
              {...register("startTime")}
            />
            {errors.startTime && (
              <p className="text-sm text-red-500 mt-1.5">
                {errors.startTime.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="endTime" className="mb-2 block">
              종료
            </Label>
            <Input
              id="endTime"
              type={allDay ? "date" : "datetime-local"}
              {...register("endTime")}
            />
            {errors.endTime && (
              <p className="text-sm text-red-500 mt-1.5">
                {errors.endTime.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="location" className="mb-2 block">
              장소 (선택)
            </Label>
            <Input id="location" {...register("location")} placeholder="장소" />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">
              메모 (선택)
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="메모"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={createEvent.isPending || updateEvent.isPending}
            >
              {createEvent.isPending || updateEvent.isPending
                ? "저장 중..."
                : event
                ? "수정"
                : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
