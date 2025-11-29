import React from "react";
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { JoinWithInvitationPage } from "./apps/(without-auth)/JoinWithInvitationPage";
import { CreateGroupPage } from "./apps/(without-auth)/CreateGroupPage";
import { SettingsPage } from "@/apps/(with-auth)/settings/SettingsPage";

// 루트 라우트 정의
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// 초대 코드로 그룹 참여 라우트
const joinWithInvitationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join-with-invitation",
  component: JoinWithInvitationPage,
});

// 그룹 생성 라우트
const createGroupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-group",
  component: CreateGroupPage,
});

// 설정 라우트
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

// 라우트 트리 구성
const routeTree = rootRoute.addChildren([
  joinWithInvitationRoute,
  createGroupRoute,
  settingsRoute,
]);

// 라우터 생성
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

// 타입 선언
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// 라우터 프로바이더 컴포넌트
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
