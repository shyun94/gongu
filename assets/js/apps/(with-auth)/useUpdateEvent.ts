import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEvent, buildCSRFHeaders, UpdateEventInput } from "../../ash_rpc";

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; input: UpdateEventInput }) => {
      const result = await updateEvent({
        input: input.input,
        fields: [
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
        primaryKey: input.id,
      });

      if (!result.success) {
        throw new Error(
          result.errors?.[0]?.message || "Failed to update event"
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
