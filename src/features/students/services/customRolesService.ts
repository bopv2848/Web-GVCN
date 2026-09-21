export interface CustomOfficerRole {
  id: string;
  title: string;
  icon: string;
  description?: string;
  studentId?: string | null;
  createdAt: string;
}

export const customRolesService = {
  getStorageKey(classId: string): string {
    return `gvcn_custom_officer_roles_${classId}`;
  },

  getCustomRoles(classId: string): CustomOfficerRole[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(classId));
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Lỗi đọc custom roles:', e);
      return [];
    }
  },

  saveCustomRole(
    classId: string,
    role: Omit<CustomOfficerRole, 'id' | 'createdAt'>
  ): CustomOfficerRole {
    const current = this.getCustomRoles(classId);
    const newRole: CustomOfficerRole = {
      ...role,
      id: `role_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...current, newRole];
    localStorage.setItem(this.getStorageKey(classId), JSON.stringify(updated));
    return newRole;
  },

  deleteCustomRole(classId: string, roleId: string): boolean {
    const current = this.getCustomRoles(classId);
    const updated = current.filter((r) => r.id !== roleId);
    localStorage.setItem(this.getStorageKey(classId), JSON.stringify(updated));
    return true;
  },

  updateCustomRoleStudent(classId: string, roleId: string, studentId: string | null): void {
    const current = this.getCustomRoles(classId);
    const updated = current.map((r) => (r.id === roleId ? { ...r, studentId } : r));
    localStorage.setItem(this.getStorageKey(classId), JSON.stringify(updated));
  },
};
