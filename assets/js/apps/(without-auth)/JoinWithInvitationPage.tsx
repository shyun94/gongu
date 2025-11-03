import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  joinWithInvitation,
  buildCSRFHeaders,
} from "../../ash_rpc";
import { Button } from "@/components/ui/Button";

export const JoinWithInvitationPage: React.FC = () => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      setError("초대 코드를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await joinWithInvitation({
        input: { inviteCode },
        fields: ["id", "groupId", "userId", "role", "status"],
        headers: buildCSRFHeaders(),
      });
      if (result.success) {
        // 그룹 가입 후 Budget Calendar 페이지로 이동
        navigate({ to: "/budget-calendar" });
      } else {
        setError(
          result.errors?.[0]?.message || "그룹 가입 중 오류가 발생했습니다."
        );
      }
    } catch (err) {
      setError("그룹 가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleJoinGroup}>
            <div className="mb-8">
              <label
                htmlFor="inviteCode"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                초대 코드 *
              </label>
              <input
                type="text"
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="초대 코드를 입력하세요"
                disabled={loading}
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                그룹 관리자로부터 받은 초대 코드를 입력해주세요
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  가입 중...
                </>
              ) : (
                "그룹 참여하기"
              )}
            </Button>
          </form>

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

