import React, { useState, useEffect } from "react";
import { listGroups, createGroup, buildCSRFHeaders } from "../ash_rpc";

type Group = {
  id: string;
  name: string;
  description: string;
  creatorId: string;
};

export const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  const loadGroups = async () => {
    try {
      setLoading(true);
      const result = await listGroups({
        fields: ["id", "name", "description", "creatorId"],
        headers: buildCSRFHeaders(),
      });

      if (result.success) {
        setGroups(result.data.results as Group[]);
      } else {
        setError("그룹을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGroupName.trim()) {
      setError("그룹 이름을 입력해주세요.");
      return;
    }

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
        setGroups([...groups, result.data as Group]);
        setNewGroupName("");
        setNewGroupDescription("");
        setShowCreateForm(false);
        setError(null);
      } else {
        setError("그룹 생성에 실패했습니다.");
      }
    } catch (err) {
      setError("그룹 생성 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleLogout = () => {
    window.location.href = "/sign-out";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              GongU - 공유 가게부
            </h1>
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">내 그룹</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            새 그룹 만들기
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">새 그룹 만들기</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label
                  htmlFor="groupName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  그룹 이름 *
                </label>
                <input
                  type="text"
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="그룹 이름을 입력하세요"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="groupDescription"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  설명 (선택사항)
                </label>
                <textarea
                  id="groupDescription"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="그룹에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  생성하기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewGroupName("");
                    setNewGroupDescription("");
                    setError(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {groups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              아직 그룹이 없습니다
            </h3>
            <p className="text-gray-500 mb-4">첫 번째 그룹을 만들어보세요!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              그룹 만들기
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-gray-600 mb-4">{group.description}</p>
                )}
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    보기
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 font-medium">
                    설정
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
