import { useQuery } from "@tanstack/react-query";
import {
  listMemberships,
  buildCSRFHeaders,
  ListMembershipsFields,
} from "../../../ash_rpc";

const MEMBERSHIPS_FIELDS: ListMembershipsFields = ["groupId"];

type UseGroupOptions = {
  enabled?: boolean;
};

export const useGroupId = (options?: UseGroupOptions) => {
  return useQuery({
    queryKey: ["group"],
    queryFn: async (): Promise<string | undefined> => {
      const result = await listMemberships({
        fields: MEMBERSHIPS_FIELDS,
        headers: buildCSRFHeaders(),
      });

      if (
        result.success &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        return result.data[0].groupId;
      }

      return undefined;
    },
    enabled: options?.enabled !== false,
  });
};
