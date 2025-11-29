import { useQuery } from "@tanstack/react-query";
import {
  listCalendars,
  buildCSRFHeaders,
  ListCalendarsFields,
} from "../../ash_rpc";

const CALENDARS_FIELDS: ListCalendarsFields = [
  "id",
  "name",
  "description",
  "color",
  "timezone",
  "visibility",
  "ownerId",
  "groupId",
];

type Calendar = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  timezone: string;
  visibility: "public" | "private";
  ownerId: string;
  groupId: string | null;
};

type UseListCalendarsOptions = {
  enabled?: boolean;
};

export const useListCalendars = (options?: UseListCalendarsOptions) => {
  return useQuery({
    queryKey: ["calendars"],
    queryFn: async (): Promise<Calendar[]> => {
      const result = await listCalendars({
        fields: CALENDARS_FIELDS,
        headers: buildCSRFHeaders(),
      });

      if (result.success) {
        let calendars: Calendar[] = [];

        if (Array.isArray(result.data)) {
          calendars = result.data;
        } else if (result.data?.results) {
          calendars = result.data.results;
        }

        return calendars;
      }

      return [];
    },
    enabled: options?.enabled !== false,
  });
};

