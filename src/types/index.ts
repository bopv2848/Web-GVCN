import type { UserRole } from './auth';

export * from './auth';
export * from './student';
export * from './points';
export * from './attendance';
export * from './dashboard';
export * from './timetable';

export interface MenuItem {
  id: string;
  path: string;
  label: string;
  iconName: string;
  roles: UserRole[];
  badge?: string | number;
}
