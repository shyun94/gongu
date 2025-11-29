import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useJoinWithInvitation } from "./useJoinWithInvitation";

const joinGroupSchema = z.object({
  inviteCode: z.string().min(1, "초대 코드를 입력해주세요."),
});

type JoinGroupFormValues = z.infer<typeof joinGroupSchema>;

export const JoinWithInvitationPage: React.FC = () => {
  const navigate = useNavigate();
  const form = useForm<JoinGroupFormValues>({
    resolver: zodResolver(joinGroupSchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  const joinMutation = useJoinWithInvitation({
    onSuccess: () => {
      navigate({ to: "/groups" });
    },
    onError: (error) => {
      toast.error(error.message || "그룹 가입 중 오류가 발생했습니다.");
    },
  });

  const onSubmit = async (values: JoinGroupFormValues) => {
    joinMutation.mutate({ inviteCode: values.inviteCode });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              그룹 참여하기
            </h1>
            <p className="text-gray-600">
              초대 코드를 입력하여 그룹에 참여하세요
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="inviteCode"
                render={({ field }) => (
                  <FormItem className="mb-8">
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      초대 코드 *
                    </FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        {...field}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        placeholder="초대 코드를 입력하세요"
                        disabled={joinMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-gray-500 mt-2">
                      그룹 관리자로부터 받은 초대 코드를 입력해주세요
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={joinMutation.isPending}
                className="w-full"
              >
                {joinMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    가입 중...
                  </>
                ) : (
                  "그룹 참여하기"
                )}
              </Button>
            </form>
          </Form>

          {/* 그룹 생성 옵션 */}
          <div className="text-center">
            <div className="border-t border-gray-200 pt-6">
              <Button
                variant={"link"}
                onClick={() => navigate({ to: "/create-group" })}
              >
                그룹을 생성하시겠습니까?
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
