import { useMutation } from "@tanstack/react-query";
import {
  joinWithInvitation,
  buildCSRFHeaders,
  JoinWithInvitationInput,
  JoinWithInvitationResult,
  JoinWithInvitationFields,
} from "../../ash_rpc";

const DEFAULT_FIELDS: JoinWithInvitationFields = [
  "id",
  "groupId",
  "userId",
  "role",
  "status",
];

type UseJoinWithInvitationOptions = {
  onSuccess?: (result: JoinWithInvitationResult<typeof DEFAULT_FIELDS>) => void;
  onError?: (error: Error | { message: string }) => void;
};

export const useJoinWithInvitation = (
  options?: UseJoinWithInvitationOptions
) => {
  return useMutation({
    mutationFn: async (input: JoinWithInvitationInput) => {
      const result = await joinWithInvitation({
        input,
        fields: DEFAULT_FIELDS,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        const errorMessage =
          result.errors?.[0]?.message || "그룹 가입 중 오류가 발생했습니다.";
        throw new Error(errorMessage);
      }

      return result;
    },
    onSuccess: (result) => {
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
    },
    onError: (error) => {
      if (options?.onError) {
        options.onError(
          error instanceof Error
            ? error
            : { message: "그룹 가입 중 오류가 발생했습니다." }
        );
      }
    },
  });
};
