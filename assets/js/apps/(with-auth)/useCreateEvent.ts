import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent, buildCSRFHeaders, CreateEventInput } from "../../ash_rpc";

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      const result = await createEvent({
        input,
        fields: [
          "id",
          "title",
          "description",
          "startTime",
          "endTime",
          "allDay",
          "location",
          "calendarId",
          "status",
        ],
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        throw new Error(
          result.errors?.[0]?.message || "Failed to create event"
        );
      }

      return result.data;
    },
    onSuccess: () => {
      // 이벤트 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
