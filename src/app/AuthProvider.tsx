import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../hooks/useAuthContext';
import { supabase } from '../services/supabaseClient';
import { authService, type ClassMembershipData } from '../services/authService';
import type { UserProfile, ClassInfo } from '../types/auth';

const fallbackClass: ClassInfo = {
  id: '66666666-6666-6666-6666-666666666666',
  name: 'LỚP 6A6',
  gradeLevel: 6,
  schoolName: 'TRƯỜNG THCS TÂN HẢI',
  academicYear: '2026 - 2027',
  themeTitle: 'CHUYẾN TÀU THANH XUÂN 6A6 • GVCN THẦY PHAN VĂN BỘ',
  themeMonth: 'CHỦ ĐIỂM THÁNG 9: TRUYỀN THỐNG NHÀ TRƯỜNG',
  logoUrl: '/logo-truong-thcs-Tan-Hai.jpg',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentClass, setCurrentClass] = useState<ClassInfo | null>(fallbackClass);
  const [membership, setMembership] = useState<ClassMembershipData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);
  const [hasNoClass, setHasNoClass] = useState<boolean>(false);

  // 1. Lắng nghe trạng thái kết nối mạng (Online/Offline)
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Hàm nạp thông tin người dùng từ Database
  const loadUserData = useCallback(async (userId: string, email: string) => {
    try {
      // Lấy Profile người dùng
      const profile = await authService.fetchUserProfile(userId);
      const userProfile: UserProfile = profile || {
        id: userId,
        email: email,
        fullName: 'Thầy Phan Văn Bộ',
        role: 'gvcn', // mặc định GVCN khi vừa tạo
      };

      // Lấy phân công lớp từ bảng class_memberships
      const mem = await authService.fetchClassMembership(userId);

      if (mem) {
        setMembership(mem);
        userProfile.role = mem.role; // Vai trò lấy từ Database
        setCurrentClass(mem.classInfo);
        setHasNoClass(false);
      } else {
        setMembership(null);
        setCurrentClass(fallbackClass);
        // Nếu không có membership thì đánh dấu chưa phân lớp (đối với giáo viên mới)
        setHasNoClass(false);
      }

      setUser(userProfile);
      setIsAuthenticated(true);
      setIsSessionExpired(false);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu người dùng từ database:', error);
      setUser({
        id: userId,
        email: email,
        fullName: 'Thầy Phan Văn Bộ',
        role: 'gvcn',
      });
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. Khởi tạo và lắng nghe Supabase Auth Session
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          if (isMounted) {
            await loadUserData(session.user.id, session.user.email || '');
          }
        } else {
          if (isMounted) {
            // Môi trường demo/dev ban đầu nếu chưa có user login
            let initialUser: UserProfile = {
              id: 'dev-gvcn-001',
              email: 'phanvanbo.6a6@thcs-tanhai.edu.vn',
              fullName: 'Thầy Phan Văn Bộ',
              role: 'gvcn',
            };
            try {
              const saved = localStorage.getItem('gvcn_user_profile');
              if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.fullName) {
                  initialUser = { ...initialUser, ...parsed };
                }
              }
            } catch {
              // Bỏ qua lỗi cú pháp
            }
            setIsAuthenticated(true);
            setUser(initialUser);
            setCurrentClass(fallbackClass);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.warn('Không thể kiểm tra session Supabase:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    // Lắng nghe sự kiện đăng nhập/đăng xuất/hết hạn token
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user.id, session.user.email || '');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setMembership(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setIsSessionExpired(false);
        } else if (event === 'USER_UPDATED' && session?.user) {
          await loadUserData(session.user.id, session.user.email || '');
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  // 4. Thao tác Đăng nhập qua Supabase Auth
  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await authService.signIn(email, pass);
      if (data.user) {
        await loadUserData(data.user.id, data.user.email || email);
      }
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  // 5. Thao tác Đăng xuất
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
    } catch (err) {
      console.warn('Lỗi đăng xuất Supabase:', err);
    } finally {
      setUser(null);
      setMembership(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  // 6. Làm mới Session khi hết hạn
  const refreshSession = async () => {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error || !session) {
      setIsSessionExpired(true);
      setIsAuthenticated(false);
    } else {
      setIsSessionExpired(false);
      await loadUserData(session.user.id, session.user.email || '');
    }
  };

  const updateCurrentClass = useCallback((updated: Partial<ClassInfo>) => {
    setCurrentClass((prev) => (prev ? { ...prev, ...updated } : prev));
  }, []);

  const updateUserProfile = useCallback(async (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = prev
        ? { ...prev, ...updated }
        : ({
            id: 'dev-gvcn-001',
            email: 'phanvanbo.6a6@thcs-tanhai.edu.vn',
            fullName: 'Thầy Phan Văn Bộ',
            role: 'gvcn',
            ...updated,
          } as UserProfile);

      try {
        localStorage.setItem('gvcn_user_profile', JSON.stringify(next));
      } catch (err) {
        console.warn('Lỗi lưu profile vào LocalStorage:', err);
      }
      return next;
    });

    if (user?.id && !user.id.startsWith('dev-')) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updated.fullName,
            avatar_url: updated.avatarUrl,
            phone: updated.phone,
          })
          .eq('id', user.id);
      } catch (err) {
        console.warn('Lỗi cập nhật profile lên Supabase:', err);
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        currentClass,
        membership,
        isAuthenticated,
        isLoading,
        isOffline,
        isSessionExpired,
        hasNoClass,
        login,
        logout,
        refreshSession,
        updateCurrentClass,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
