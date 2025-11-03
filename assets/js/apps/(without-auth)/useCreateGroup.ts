import { useMutation } from "@tanstack/react-query";
import {
  createGroup,
  buildCSRFHeaders,
  CreateGroupInput,
  CreateGroupResult,
  CreateGroupFields,
} from "../../ash_rpc";

const DEFAULT_FIELDS: CreateGroupFields = [
  "id",
  "name",
  "description",
  "creatorId",
];

type UseCreateGroupOptions = {
  onSuccess?: (result: CreateGroupResult<typeof DEFAULT_FIELDS>) => void;
  onError?: (error: Error | { message: string }) => void;
};

export const useCreateGroup = (options?: UseCreateGroupOptions) => {
  return useMutation({
    mutationFn: async (input: CreateGroupInput) => {
      const result = await createGroup({
        input,
        fields: DEFAULT_FIELDS,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        const errorMessage =
          result.errors?.[0]?.message || "그룹 생성 중 오류가 발생했습니다.";
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
            : { message: "그룹 생성 중 오류가 발생했습니다." }
        );
      }
    },
  });
};
