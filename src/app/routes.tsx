import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { StudentsPage } from '../features/students/pages/StudentsPage';
import { PointsPage } from '../features/points/pages/PointsPage';
import { RewardsPage } from '../features/rewards/pages/RewardsPage';
import { AttendancePage } from '../features/attendance/pages/AttendancePage';
import { SeatingPage } from '../features/seating/pages/SeatingPage';
import { TimetablePage } from '../features/timetable/pages/TimetablePage';
import { TeachingPlanPage } from '../features/teaching-plan/pages/TeachingPlanPage';
import { ClassroomToolsPage } from '../features/classroom-tools/pages/ClassroomToolsPage';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import { CompanionPage } from '../features/companion/pages/CompanionPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { ParentPortalPage } from '../features/parent-portal/pages/ParentPortalPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
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
        <Route path="/companion" element={<CompanionPage />} />
        <Route path="/parent-portal" element={<ParentPortalPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
