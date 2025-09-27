import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GroupList } from "./components/GroupList";

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <GroupList />
      </div>
    </QueryClientProvider>
  );
};

// React 앱을 DOM에 마운트
const container = document.getElementById("react-root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("React root element not found");
}
