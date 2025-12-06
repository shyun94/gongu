import { useQuery } from "@tanstack/react-query";
import {
  listEvents,
  buildCSRFHeaders,
  ListEventsFields,
} from "../../../ash_rpc";

const EVENTS_FIELDS: ListEventsFields = [
  "id",
  "title",
  "description",
  "startTime",
  "endTime",
  "allDay",
  "location",
  "calendarId",
  "status",
  "createdById",
];

export type Event = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location: string | null;
  calendarId: string;
  status: "confirmed" | "tentative" | "cancelled";
  createdById: string;
};

type UseListEventsOptions = {
  enabled?: boolean;
  startDate?: Date;
  endDate?: Date;
};

export const useListEvents = (options?: UseListEventsOptions) => {
  return useQuery({
    queryKey: ["events", options?.startDate, options?.endDate],
    queryFn: async (): Promise<Event[]> => {
      const result = await listEvents({
        fields: EVENTS_FIELDS,
        headers: buildCSRFHeaders(),
      });

      if (result.success) {
        let events: Event[] = [];

        if (Array.isArray(result.data)) {
          events = result.data;
        } else if (result.data?.results) {
          events = result.data.results;
        }

        // 날짜 범위 필터링 (클라이언트 측)
        if (options?.startDate || options?.endDate) {
          events = events.filter((event) => {
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);

            if (options.startDate && eventEnd < options.startDate) {
              return false;
            }
            if (options.endDate && eventStart > options.endDate) {
              return false;
            }
            return true;
          });
        }

        return events;
      }

      return [];
    },
    enabled: options?.enabled !== false,
  });
};
