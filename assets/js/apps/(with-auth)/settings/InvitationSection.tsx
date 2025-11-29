import React from "react";
import { Button } from "@/components/ui/_button";
import { toast } from "sonner";
import { useGroupId } from "./useGroupId";
import { useCreateInvitation } from "./useCreateInvitation";
import { useListInvitations } from "./useListInvitations";

export const InvitationSection: React.FC = () => {
  const { data: groupId, isLoading: isLoadingGroup } = useGroupId();

  const { data: invitations = [], isLoading: isLoadingInvitations } =
    useListInvitations({
      groupId,
      enabled: !!groupId,
    });

  const createInvitationMutation = useCreateInvitation({
    onSuccess: (result) => {
      if (result.data.code) {
        navigator.clipboard.writeText(result.data.code);
        toast.success("초대 코드가 생성되고 복사되었습니다.", {
          position: "top-center",
          duration: 3000,
        });
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "초대 코드 생성에 실패했습니다.",
        {
          position: "top-center",
          duration: 3000,
        }
      );
    },
  });

  const handleClickCodeGeneration = () => {
    if (!groupId) {
      toast.error("그룹 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    createInvitationMutation.mutate({ groupId });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        그룹에 다른 사람을 초대할 수 있습니다. <br /> 코드를 생성하고
        전달해주세요.
      </p>

      <div className="flex flex-col gap-3">
        {isLoadingInvitations ? (
          <div className="text-sm text-gray-500">
            초대 코드 목록을 불러오는 중...
          </div>
        ) : invitations.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">
              생성된 초대 코드
            </div>
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-mono text-sm">{invitation.code}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {invitation.status === "pending" && "대기 중"}
                    {invitation.status === "accepted" && "사용됨"}
                    {invitation.status === "expired" && "만료됨"}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(invitation.code);
                    toast.success("초대 코드가 복사되었습니다.", {
                      position: "top-center",
                      duration: 3000,
                    });
                  }}
                  className="ml-2 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                >
                  복사
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            생성된 초대 코드가 없습니다.
          </div>
        )}
        <Button
          onClick={handleClickCodeGeneration}
          disabled={!groupId || createInvitationMutation.isPending}
        >
          {createInvitationMutation.isPending
            ? "생성 중..."
            : isLoadingGroup
            ? "로딩 중..."
            : "초대 코드 생성"}
        </Button>
      </div>
    </div>
  );
};
