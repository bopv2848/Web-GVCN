import { createContext } from 'react';
import type { UserProfile, ClassInfo } from '../types/auth';
import type { ClassMembershipData } from '../services/authService';

export interface AuthContextType {
  user: UserProfile | null;
  currentClass: ClassInfo | null;
  membership: ClassMembershipData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOffline: boolean;
  isSessionExpired: boolean;
  hasNoClass: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
