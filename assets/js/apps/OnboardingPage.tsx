import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { createGroup, buildCSRFHeaders, joinWithInvitation } from "../ash_rpc";

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
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
        {!showCreateForm ? (
          /* 초대 코드 입력 화면 */
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center mb-6"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    가입 중...
                  </>
                ) : (
                  "그룹 참여하기"
                )}
              </button>
            </form>

            {/* 그룹 생성 옵션 */}
            <div className="text-center">
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  그룹을 생성하시겠습니까?
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 그룹 생성 폼 */
          <div>
            {/* 헤더 */}
            <div className="text-center mb-8">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setError(null);
                }}
                className="text-blue-600 hover:text-blue-700 mb-4 flex items-center text-sm transition-colors mx-auto"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                뒤로 가기
              </button>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      생성 중...
                    </>
                  ) : (
                    "그룹 만들기"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
