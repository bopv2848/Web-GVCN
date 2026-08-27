import React, { useState, useEffect } from 'react';
import type { Student, Group } from '../../../types/student';
import { studentSchema, type StudentFormData } from '../schemas/studentSchema';
import { Button } from '../../../components/common/Button';
import { storageService } from '../../../services/storageService';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => Promise<void>;
  student?: Student | null;
  groups: Group[];
  classId: string;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  student,
  groups,
  classId,
}) => {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [birthDate, setBirthDate] = useState('');
  const [groupId, setGroupId] = useState<string>('');
  const [classRole, setClassRole] = useState('Thành viên');
  const [boardingType, setBoardingType] = useState<'Bán trú' | 'Ngoại trú' | 'Nội trú'>('Bán trú');
  const [goals, setGoals] = useState('');
  const [talents, setTalents] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [code, setCode] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFullName(student.fullName);
      setGender(student.gender);
      setBirthDate(student.birthDate || '');
      setGroupId(student.groupId || '');
      setClassRole(student.classRole || 'Thành viên');
      setBoardingType((student.boardingType as 'Bán trú' | 'Ngoại trú' | 'Nội trú') || 'Bán trú');
      setGoals(student.goals || '');
      setTalents(student.talents || '');
      setAvatarUrl(student.avatarUrl || null);
      setCode(student.code || '');
    } else {
      setFullName('');
      setGender('Nam');
      setBirthDate('');
      setGroupId(groups[0]?.id || '');
      setClassRole('Thành viên');
      setBoardingType('Bán trú');
      setGoals('');
      setTalents('');
      setAvatarUrl(null);
      setCode('');
    }
    setFormErrors({});
  }, [student, groups, isOpen]);

  if (!isOpen) return null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await storageService.uploadStudentAvatar(
        file,
        classId,
        student?.id || `temp-${Date.now()}`
      );
      setAvatarUrl(uploadedUrl);
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || 'Lỗi tải ảnh đại diện lên kho lưu trữ.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const rawData = {
      fullName,
      gender,
      birthDate: birthDate || undefined,
      groupId: groupId || null,
      classRole,
      boardingType,
      goals,
      talents,
      avatarUrl,
      code,
    };

    const parseResult = studentSchema.safeParse(rawData);
    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      parseResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[String(err.path[0])] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(parseResult.data);
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFormErrors({ form: error.message || 'Không thể lưu học sinh. Vui lòng thử lại.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <h2 className="text-lg font-black text-slate-850">
            {student ? 'Chỉnh Sửa Hồ Sơ Học Sinh' : 'Thêm Học Sinh Mới Vào Lớp'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {formErrors.form && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl mb-4">
            ⚠️ {formErrors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-300 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-primary flex items-center justify-center text-2xl font-black">
                  {fullName ? fullName.charAt(0) : '👤'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ảnh đại diện (Private Storage &le; 5MB):
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={isUploading}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer"
              />
              {isUploading && <p className="text-[11px] text-amber-600 font-bold mt-1">Đang tải ảnh lên...</p>}
            </div>
          </div>

          {/* Họ và tên */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Họ và tên học sinh <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white focus:border-primary outline-none"
              placeholder="vd: Nguyễn Văn An"
            />
            {formErrors.fullName && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">{formErrors.fullName}</p>
            )}
          </div>

          {/* Giới tính & Ngày sinh */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Giới tính <span className="text-rose-500">*</span>:
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Nam' | 'Nữ')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white outline-none"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Ngày sinh:
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white outline-none"
              />
            </div>
          </div>

          {/* Tổ thi đua & Chức vụ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Tổ thi đua:
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white outline-none"
              >
                <option value="">-- Chưa chia tổ --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Chức vụ lớp:
              </label>
              <select
                value={classRole}
                onChange={(e) => setClassRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white outline-none"
              >
                <option value="Thành viên">Thành viên</option>
                <option value="Lớp trưởng">Lớp trưởng</option>
                <option value="Lớp phó">Lớp phó</option>
                <option value="Tổ trưởng">Tổ trưởng</option>
                <option value="Tổ phó">Tổ phó</option>
                <option value="Ủy viên BCH">Ủy viên BCH</option>
              </select>
            </div>
          </div>

          {/* Hình thức lưu trú */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Hình thức lưu trú:
            </label>
            <div className="flex gap-4">
              {['Bán trú', 'Ngoại trú', 'Nội trú'].map((type) => (
                <label key={type} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="boardingType"
                    value={type}
                    checked={boardingType === type}
                    onChange={() => setBoardingType(type as 'Bán trú' | 'Ngoại trú' | 'Nội trú')}
                    className="accent-primary"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Mục tiêu & Năng khiếu */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Mục tiêu năm học:
            </label>
            <input
              type="text"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white outline-none"
              placeholder="vd: Thi đỗ Đại học Y Hà Nội, IELTS 7.0..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Năng khiếu / Sở trường:
            </label>
            <input
              type="text"
              value={talents}
              onChange={(e) => setTalents(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white outline-none"
              placeholder="vd: Hát, MC, Cầu lông, Đàn guitar..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button type="button" onClick={onClose} variant="outline" size="md" className="flex-1">
              HỦY BỎ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="flex-1"
              isLoading={isSubmitting}
            >
              {student ? 'LƯU THAY ĐỔI' : 'THÊM VÀO LỚP'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
