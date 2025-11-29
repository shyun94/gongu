import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { useCreateGroup } from "./useCreateGroup";

const createGroupSchema = z.object({
  name: z.string().min(1, "그룹 이름을 입력해주세요."),
  description: z.string().optional(),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

export const CreateGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createMutation = useCreateGroup({
    onSuccess: () => {
      navigate({ to: "/calendar" });
    },
    onError: (error) => {
      form.setError("root", {
        message: error.message || "그룹 생성 중 오류가 발생했습니다.",
      });
    },
  });

  const onSubmit = async (values: CreateGroupFormValues) => {
    createMutation.mutate({
      name: values.name,
      description: values.description || null,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <Button
            variant="link"
            onClick={() => {
              navigate({ to: "/join-with-invitation" });
              form.clearErrors();
            }}
          >
            <ArrowLeft />
            뒤로 가기
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">새 그룹 만들기</h2>
        </div>

        {/* 콘텐츠 영역 */}
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {form.formState.errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  {form.formState.errors.root.message}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      그룹 이름 *
                    </FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        {...field}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        placeholder="예) 우리 가족"
                        disabled={createMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mb-8">
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      설명 (선택사항)
                    </FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        placeholder="그룹에 대한 간단한 설명을 입력하세요"
                        rows={3}
                        disabled={createMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    생성 중...
                  </>
                ) : (
                  "그룹 만들기"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
