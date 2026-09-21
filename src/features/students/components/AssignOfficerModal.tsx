import React, { useState, useMemo } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { getUserInitial } from '../../../utils/userUtils';
import type { Student } from '../../../types/student';

interface AssignOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleTitle: string;
  roleIcon: string;
  currentStudent?: Student | null;
  allStudents: Student[];
  onAssign: (studentId: string | null) => Promise<void> | void;
}

export const AssignOfficerModal: React.FC<AssignOfficerModalProps> = ({
  isOpen,
  onClose,
  roleTitle,
  roleIcon,
  currentStudent,
  allStudents,
  onAssign,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Danh sách các tổ
  const uniqueGroups = useMemo(() => {
    const set = new Set<string>();
    allStudents.forEach((s) => {
      if (s.groupName) set.add(s.groupName);
    });
    return Array.from(set).sort();
  }, [allStudents]);

  // Lọc học sinh
  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchGroup = selectedGroup === 'all' || s.groupName === selectedGroup;
      return matchSearch && matchGroup;
    });
  }, [allStudents, searchQuery, selectedGroup]);

  const handleSelectStudent = async (studentId: string) => {
    setIsSubmitting(true);
    try {
      await onAssign(studentId);
      onClose();
    } catch (e) {
      console.error('Lỗi phân công cán sự:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAssignment = async () => {
    setIsSubmitting(true);
    try {
      await onAssign(null);
      onClose();
    } catch (e) {
      console.error('Lỗi gỡ phân công cán sự:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Phân Công Chức Vụ: ${roleTitle}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Header thông tin chức vụ */}
        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{roleIcon}</span>
            <div>
              <h4 className="text-sm font-black text-slate-850 uppercase tracking-wide">
                {roleTitle}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {currentStudent ? (
                  <span>
                    Hiện tại: <strong className="text-primary">{currentStudent.fullName}</strong> ({currentStudent.groupName || 'Chưa chia tổ'})
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold">Chưa có học sinh đảm nhiệm</span>
                )}
              </p>
            </div>
          </div>

          {currentStudent && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={handleRemoveAssignment}
              className="text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              🗑️ Bỏ phân công
            </Button>
          )}
        </div>

        {/* Thanh tìm kiếm & lọc tổ */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Tìm kiếm học sinh theo họ tên..."
              className="w-full px-3.5 py-2 pl-9 rounded-xl border border-slate-300 text-xs font-semibold text-slate-850 focus:border-primary outline-none"
            />
            <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="all">Tất cả tổ</option>
              {uniqueGroups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Danh sách học sinh để chọn */}
        <div className="max-h-[380px] overflow-y-auto custom-scrollbar border border-slate-200 rounded-2xl divide-y divide-slate-100">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium italic">
              Không tìm thấy học sinh phù hợp.
            </div>
          ) : (
            filteredStudents.map((stu) => {
              const isCurrent = currentStudent?.id === stu.id;
              return (
                <div
                  key={stu.id}
                  onClick={() => !isSubmitting && handleSelectStudent(stu.id)}
                  className={`p-3 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-primary/10 border-l-4 border-primary'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary text-white font-black text-xs flex items-center justify-center shadow-xs overflow-hidden">
                      {stu.avatarUrl ? (
                        <img src={stu.avatarUrl} alt={stu.fullName} className="w-full h-full object-cover" />
                      ) : (
                        getUserInitial(stu.fullName)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-850">{stu.fullName}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {stu.groupName || 'Tổ'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {stu.gender} • {stu.code || 'HS'} •{' '}
                        <span className={stu.classRole && stu.classRole !== 'Thành viên' ? 'text-amber-700 font-bold' : 'text-slate-500'}>
                          Chức vụ hiện tại: {stu.classRole || 'Thành viên'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    {isCurrent ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center gap-1">
                        ✓ Đang đảm nhiệm
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        className="px-3 py-1.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover active:scale-95 transition-all cursor-pointer shadow-xs"
                      >
                        Chọn em này
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>💡 Bấm vào học sinh để hoàn tất phân công tức thì.</span>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
