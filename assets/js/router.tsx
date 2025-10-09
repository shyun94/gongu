import React from "react";
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { IndexPage } from "./apps/IndexPage";
import { OnboardingPage } from "./apps/OnboardingPage";
import { GroupsPage } from "./apps/group/GroupsPage";
import { BudgetCalendarPage } from "@/apps/budget/BudgetCalendarPage";
import { SettingsPage } from "@/apps/settings/SettingsPage";

// 루트 라우트 정의
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// 인덱스 라우트 - 자동 리디렉션
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexPage,
});

// 온보딩 라우트
const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingPage,
});

// 그룹 목록 라우트
const groupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/groups",
  component: GroupsPage,
});

// Budget Calendar 라우트
const budgetCalendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/budget-calendar",
  component: BudgetCalendarPage,
});

// 설정 라우트
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

// 라우트 트리 구성
const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,
  groupsRoute,
  budgetCalendarRoute,
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
