import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { listGroups, buildCSRFHeaders } from "../ash_rpc";

export const IndexPage: React.FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkGroups = async () => {
      try {
        const result = await listGroups({
          fields: ["id"],
          headers: buildCSRFHeaders(),
        });

        if (result.success) {
          // 그룹이 있으면 그룹 목록으로, 없으면 온보딩으로
          if (result.data.results.length > 0) {
            navigate({ to: "/groups" });
          } else {
            navigate({ to: "/onboarding" });
          }
        } else {
          // 오류 발생 시 온보딩으로
          navigate({ to: "/onboarding" });
        }
      } catch (err) {
        console.error("그룹 확인 중 오류:", err);
        navigate({ to: "/onboarding" });
      } finally {
        setChecking(false);
      }
    };

    checkGroups();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }
};
