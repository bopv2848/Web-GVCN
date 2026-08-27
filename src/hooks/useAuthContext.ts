import { createContext } from 'react';
import type { UserProfile, UserRole, ClassInfo } from '../types/auth';

export interface AuthContextType {
  user: UserProfile | null;
  currentClass: ClassInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setRole: (role: UserRole) => void;
  login: (role?: UserRole) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
