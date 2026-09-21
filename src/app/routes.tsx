import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import { PageLoadingFallback } from '../components/common/PageLoadingFallback';

import { ForbiddenPage } from '../features/auth/pages/ForbiddenPage';

// Auth Pages (Lazy Loaded)
const LoginPage = lazy(() =>
  import('../features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const ResetPasswordPage = lazy(() =>
  import('../features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const InvitePage = lazy(() =>
  import('../features/auth/pages/InvitePage').then((m) => ({ default: m.InvitePage }))
);

// Feature Pages (Lazy Loaded)
const DashboardPage = lazy(() =>
  import('../features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const StudentsPage = lazy(() =>
  import('../features/students/pages/StudentsPage').then((m) => ({ default: m.StudentsPage }))
);
const PointsPage = lazy(() =>
  import('../features/points/pages/PointsPage').then((m) => ({ default: m.PointsPage }))
);
const RewardsPage = lazy(() =>
  import('../features/rewards/pages/RewardsPage').then((m) => ({ default: m.RewardsPage }))
);
const AttendancePage = lazy(() =>
  import('../features/attendance/pages/AttendancePage').then((m) => ({ default: m.AttendancePage }))
);
const SeatingPage = lazy(() =>
  import('../features/seating/pages/SeatingPage').then((m) => ({ default: m.SeatingPage }))
);
const SeatingRemotePage = lazy(() =>
  import('../features/seating/pages/SeatingRemotePage').then((m) => ({ default: m.SeatingRemotePage }))
);
const TimetablePage = lazy(() =>
  import('../features/timetable/pages/TimetablePage').then((m) => ({ default: m.TimetablePage }))
);
const TeachingPlanPage = lazy(() =>
  import('../features/teaching-plan/pages/TeachingPlanPage').then((m) => ({ default: m.TeachingPlanPage }))
);
const ClassroomToolsPage = lazy(() =>
  import('../features/classroom-tools/pages/ClassroomToolsPage').then((m) => ({ default: m.ClassroomToolsPage }))
);
const ReportsPage = lazy(() =>
  import('../features/reports/pages/ReportsPage').then((m) => ({ default: m.ReportsPage }))
);
const CompanionPage = lazy(() =>
  import('../features/companion/pages/CompanionPage').then((m) => ({ default: m.CompanionPage }))
);
const SettingsPage = lazy(() =>
  import('../features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const ParentPortalPage = lazy(() =>
  import('../features/parent-portal/pages/ParentPortalPage').then((m) => ({ default: m.ParentPortalPage }))
);
const VerifyReportPage = lazy(() =>
  import('../features/reports/pages/VerifyReportPage').then((m) => ({ default: m.VerifyReportPage }))
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/invite/:token" element={<InvitePage />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* Public Parent Portal Routes (Dành cho Phụ Huynh tra cứu qua Link Zalo / Mã PIN - Không cần đăng nhập) */}
        <Route path="/tra-cuu" element={<ParentPortalPage />} />
        <Route path="/tra-cuu/:token" element={<ParentPortalPage />} />
        <Route path="/parent-portal/:token" element={<ParentPortalPage />} />

        {/* Public Report Verification Route (Xác thực báo cáo điện tử qua quét mã QR) */}
        <Route path="/verify-report" element={<VerifyReportPage />} />

        {/* Public Seating Remote Controller Route (Quét QR điều khiển TV từ xa) */}
        <Route path="/seating/remote" element={<SeatingRemotePage />} />

        {/* Protected Routes (Yêu cầu đăng nhập hợp lệ qua Supabase Auth) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Dashboard & Chung */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/points" element={<PointsPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/seating" element={<SeatingPage />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/teaching-plan" element={<TeachingPlanPage />} />
            <Route path="/classroom-tools" element={<ClassroomToolsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/parent-portal" element={<ParentPortalPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Phân hệ Đặc biệt bảo mật: Trạm đồng hành (CHỈ GVCN) */}
            <Route
              path="/companion"
              element={
                <PermissionGuard allowedRoles={['gvcn']}>
                  <CompanionPage />
                </PermissionGuard>
              }
            />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
