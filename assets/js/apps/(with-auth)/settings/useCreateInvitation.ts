import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createInvitation,
  buildCSRFHeaders,
  CreateInvitationInput,
  CreateInvitationResult,
  CreateInvitationFields,
} from "../../../ash_rpc";

const INVITATION_FIELDS: CreateInvitationFields = ["code", "groupId"];

type CreateInvitationSuccessResult = Extract<
  CreateInvitationResult<typeof INVITATION_FIELDS>,
  { success: true }
>;

type UseCreateInvitationOptions = {
  onSuccess?: (result: CreateInvitationSuccessResult) => void;
  onError?: (error: Error | { message: string }) => void;
};

export const useCreateInvitation = (options?: UseCreateInvitationOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: CreateInvitationInput
    ): Promise<CreateInvitationSuccessResult> => {
      const result = await createInvitation({
        input,
        fields: INVITATION_FIELDS,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        const errorMessage =
          result.errors?.[0]?.message ||
          "초대 코드 생성 중 오류가 발생했습니다.";
        throw new Error(errorMessage);
      }

      return result;
    },
    onSuccess: (result) => {
      if (options?.onSuccess) {
        options.onSuccess(result);
      }

      console.log("invalidateQueries", result.data.groupId);
      queryClient.invalidateQueries({
        queryKey: ["invitations", result.data.groupId],
      });
    },
    onError: (error) => {
      if (options?.onError) {
        options.onError(
          error instanceof Error
            ? error
            : { message: "초대 코드 생성 중 오류가 발생했습니다." }
        );
      }
    },
  });
};
