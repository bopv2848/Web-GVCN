import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PermissionGuard } from './PermissionGuard';
import { AuthContext } from '../../hooks/useAuthContext';
import type { UserProfile, ClassInfo } from '../../types/auth';

const mockClass: ClassInfo = {
  id: '66666666-6666-6666-6666-666666666666',
  name: 'LỚP 6A6',
  gradeLevel: 6,
  schoolName: 'TRƯỜNG THCS TÂN HẢI',
  academicYear: '2026 - 2027',
  themeTitle: 'CHUYẾN TÀU THANH XUÂN 6A6 • GVCN THẦY PHAN VĂN BỘ',
  themeMonth: 'CHỦ ĐIỂM THÁNG 9',
  logoUrl: '/logo-truong-thcs-Tan-Hai.jpg',
};

describe('PermissionGuard Security Access Control', () => {
  it('allows GVCN to view protected companion content', () => {
    const gvcnUser: UserProfile = {
      id: 'u1',
      email: 'gvcn@test.edu.vn',
      fullName: 'Thầy GVCN',
      role: 'gvcn',
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            user: gvcnUser,
            currentClass: mockClass,
            membership: null,
            isAuthenticated: true,
            isLoading: false,
            isOffline: false,
            isSessionExpired: false,
            hasNoClass: false,
            login: async () => {},
            logout: async () => {},
            refreshSession: async () => {},
            updateCurrentClass: () => {},
          }}
        >
          <PermissionGuard allowedRoles={['gvcn']}>
            <div>NỘI DUNG BẢO MẬT TRẠM ĐỒNG HÀNH</div>
          </PermissionGuard>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText(/NỘI DUNG BẢO MẬT TRẠM ĐỒNG HÀNH/i)).toBeInTheDocument();
  });

  it('blocks Ban Cán Sự (BCS) and displays 403 Forbidden', () => {
    const bcsUser: UserProfile = {
      id: 'u2',
      email: 'bcs@test.edu.vn',
      fullName: 'Em Lớp Trưởng',
      role: 'bancansu',
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            user: bcsUser,
            currentClass: mockClass,
            membership: null,
            isAuthenticated: true,
            isLoading: false,
            isOffline: false,
            isSessionExpired: false,
            hasNoClass: false,
            login: async () => {},
            logout: async () => {},
            refreshSession: async () => {},
            updateCurrentClass: () => {},
          }}
        >
          <PermissionGuard allowedRoles={['gvcn']}>
            <div>NỘI DUNG BẢO MẬT TRẠM ĐỒNG HÀNH</div>
          </PermissionGuard>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.queryByText(/NỘI DUNG BẢO MẬT TRẠM ĐỒNG HÀNH/i)).not.toBeInTheDocument();
    expect(screen.getByText(/403 - Quyền Truy Cập Bị Giới Hạn/i)).toBeInTheDocument();
  });
});
