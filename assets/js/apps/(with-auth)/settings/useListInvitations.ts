import { useQuery } from "@tanstack/react-query";
import {
  listInvitations,
  buildCSRFHeaders,
  ListInvitationsFields,
  GonguGroupsInvitationFilterInput,
} from "../../../ash_rpc";

const INVITATIONS_FIELDS: ListInvitationsFields = [
  "id",
  "code",
  "status",
  "expiresAt",
  "usedAt",
  "groupId",
];

type Invitation = {
  id: string;
  code: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: string;
  usedAt: string | null;
  groupId: string;
};

type UseListInvitationsOptions = {
  groupId?: string | null;
  enabled?: boolean;
};

export const useListInvitations = (options?: UseListInvitationsOptions) => {
  return useQuery({
    queryKey: ["invitations", options?.groupId],
    queryFn: async (): Promise<Invitation[]> => {
      const filter: GonguGroupsInvitationFilterInput | undefined =
        options?.groupId
          ? {
              groupId: {
                eq: options.groupId,
              },
            }
          : undefined;

      const result = await listInvitations({
        fields: INVITATIONS_FIELDS,
        filter,
        sort: "-id",
        headers: buildCSRFHeaders(),
      });

      if (result.success) {
        if (Array.isArray(result.data)) {
          return result.data;
        }
        if (result.data?.results) {
          return result.data.results;
        }
      }

      return [];
    },
    enabled: options?.enabled !== false && !!options?.groupId,
  });
};
