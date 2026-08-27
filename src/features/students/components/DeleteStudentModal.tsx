import React, { useState } from 'react';
import type { Student } from '../../../types/student';
import { Button } from '../../../components/common/Button';

interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (studentId: string) => Promise<void>;
  student: Student | null;
}

export const DeleteStudentModal: React.FC<DeleteStudentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  student,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !student) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(student.id);
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || 'Không thể xóa học sinh. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-rose-100 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center text-3xl font-black mb-4 shadow-inner">
          ⚠️
        </div>

        <h3 className="text-xl font-black text-slate-850 mb-2">
          Xác Nhận Xóa Học Sinh Khỏi Lớp
        </h3>

        <p className="text-sm font-semibold text-slate-700 mb-4">
          Thầy/Cô có chắc chắn muốn xóa em <strong className="text-rose-600 font-black">{student.fullName}</strong> ({student.groupName}) không?
        </p>

        {/* Cảnh báo ảnh hưởng dữ liệu liên quan */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-left text-xs text-rose-800 space-y-1.5 mb-6 leading-relaxed">
          <p className="font-bold">🚨 Các tác động khi xóa học sinh:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>Học sinh sẽ bị ẩn khỏi danh sách lớp và điểm danh hàng ngày.</li>
            <li>Lịch sử điểm thi đua (+{student.points}đ) và sao thưởng ({student.stars}⭐) được lưu trữ đóng băng.</li>
            <li>Liên kết ứng dụng của Phụ huynh sẽ bị vô hiệu hóa.</li>
            <li>Dữ liệu hồ sơ Trạm đồng hành (nếu có) sẽ được lưu trữ bảo mật trong kho lưu trữ.</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            size="md"
            className="flex-1"
            disabled={isDeleting}
          >
            HỦY BỎ
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            variant="danger"
            size="md"
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black"
            isLoading={isDeleting}
          >
            ĐỒNG Ý XÓA
          </Button>
        </div>
      </div>
    </div>
  );
};
