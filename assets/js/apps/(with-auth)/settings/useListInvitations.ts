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
        let invitations: Invitation[] = [];

        if (Array.isArray(result.data)) {
          invitations = result.data;
        } else if (result.data?.results) {
          invitations = result.data.results;
        }

        // 사용됨(accepted) 또는 만료됨(expired) 상태인 초대 코드는 제외
        return invitations.filter(
          (invitation) =>
            invitation.status !== "accepted" && invitation.status !== "expired"
        );
      }

      return [];
    },
    enabled: options?.enabled !== false && !!options?.groupId,
  });
};
