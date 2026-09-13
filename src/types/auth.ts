export type UserRole = 'gvcn' | 'teacher' | 'bancansu' | 'bgh' | 'bgh_viewer' | 'student' | 'parent' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  signatureUrl?: string;
  showSignatureInReports?: boolean;
  phone?: string;
  role: UserRole;
}

export interface ClassInfo {
  id: string;
  name: string;
  gradeLevel: number;
  schoolName: string;
  academicYear: string;
  themeTitle: string;
  themeMonth: string;
  bannerUrl?: string;
  logoUrl?: string;
}

export interface AuthState {
  user: UserProfile | null;
  currentClass: ClassInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
