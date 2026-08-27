export * from './auth';
export * from './student';
export * from './points';

export interface MenuItem {
  id: string;
  path: string;
  label: string;
  iconName: string;
  roles: Array<'gvcn' | 'bancansu' | 'bgh' | 'student' | 'parent' | 'admin'>;
  badge?: string | number;
}
