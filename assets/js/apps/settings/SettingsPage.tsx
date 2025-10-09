import React, { useCallback, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

function generateInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no easily-confused chars
  const length = 8;
  let code = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * alphabet.length);
    code += alphabet[idx];
  }
  return code;
}

export const SettingsPage: React.FC = () => {
  const [inviteCode, setInviteCode] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = useCallback(() => {
    setInviteCode(generateInviteCode());
    setCopied(false);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // noop
    }
  }, [inviteCode]);

  return (
    <div className="w-full h-full bg-white">
      <div className="relative flex items-center justify-center p-3 border-b border-gray-200">
        <Link
          to="/budget-calendar"
          className="absolute left-3 top-1/2 -translate-y-1/2"
        >
          <button
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label="뒤로"
          >
            <span className="text-base">←</span>
          </button>
        </Link>
        <h2 className="text-lg font-semibold text-gray-900">설정</h2>
      </div>

      <div className="p-4 space-y-6">
        <section className="space-y-3">
          <h3 className="text-base font-medium text-gray-900">초대코드</h3>
          <p className="text-sm text-gray-600">
            그룹에 다른 사람을 초대할 수 있습니다. <br /> 코드를 생성하고
            전달해주세요.
          </p>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={inviteCode}
              placeholder="생성된 코드가 여기에 표시됩니다"
              readOnly
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none"
            />
            <button
              onClick={() => {
                if (!inviteCode) {
                  handleGenerate();
                  return;
                }
                handleCopy();
              }}
              className="w-full px-4 py-3 rounded-md bg-blue-600 text-white text-center font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none"
            >
              {inviteCode ? (copied ? "복사됨" : "복사") : "코드 생성"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
