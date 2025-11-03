import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  createGroup,
  buildCSRFHeaders,
} from "../../ash_rpc";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export const CreateGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGroupName.trim()) {
      setError("그룹 이름을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createGroup({
        fields: ["id", "name", "description", "creatorId"],
        input: {
          name: newGroupName,
          description: newGroupDescription || null,
        },
        headers: buildCSRFHeaders(),
      });

      if (result.success) {
        // 그룹 생성 후 Budget Calendar 페이지로 이동
        navigate({ to: "/budget-calendar" });
      } else {
        setError("그룹 생성에 실패했습니다.");
      }
    } catch (err) {
      setError("그룹 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
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
              setError(null);
            }}
          >
            <ArrowLeft />
            뒤로 가기
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">
            새 그룹 만들기
          </h2>
        </div>

        {/* 콘텐츠 영역 */}
        <div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateGroup}>
            <div className="mb-6">
              <label
                htmlFor="groupName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                그룹 이름 *
              </label>
              <input
                type="text"
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="예) 우리 가족"
                disabled={loading}
                required
              />
            </div>

            <div className="mb-8">
              <label
                htmlFor="groupDescription"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                설명 (선택사항)
              </label>
              <textarea
                id="groupDescription"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="그룹에 대한 간단한 설명을 입력하세요"
                rows={3}
                disabled={loading}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  생성 중...
                </>
              ) : (
                "그룹 만들기"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

