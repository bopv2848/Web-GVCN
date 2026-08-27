import React, { useState } from 'react';
import { AuthContext } from '../hooks/useAuthContext';
import type { UserProfile, UserRole, ClassInfo } from '../types/auth';

const defaultClass: ClassInfo = {
  id: 'class-12a1',
  name: 'LỚP 12A1',
  gradeLevel: 12,
  schoolName: 'THPT THANH XUÂN',
  academicYear: '2026 - 2027',
  themeTitle: 'CHUYẾN TÀU THANH XUÂN',
  themeMonth: 'CHỦ ĐIỂM THÁNG 9: MÁI TRƯỜNG MẾN YÊU',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setCurrentRole] = useState<UserRole>('gvcn');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const user: UserProfile = {
    id: 'user-001',
    email: 'giaovien.12a1@thpt-thanhxuan.edu.vn',
    fullName:
      role === 'gvcn'
        ? 'Cô Nguyễn Mai Hương'
        : role === 'bancansu'
          ? 'Em Trần Minh Trí (Lớp trưởng)'
          : role === 'bgh'
            ? 'Thầy Hiệu Trưởng'
            : role === 'parent'
              ? 'Phụ huynh em Nguyễn Văn A'
              : 'Em Nguyễn Văn A',
    role: role,
  };

  const setRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
  };

  const login = (loginRole: UserRole = 'gvcn') => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentRole(loginRole);
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 200);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user: isAuthenticated ? user : null,
        currentClass: defaultClass,
        isAuthenticated,
        isLoading,
        setRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
