import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { Student } from '../../../types/student';

interface AddCustomRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  allStudents: Student[];
  onSave: (roleData: {
    title: string;
    icon: string;
    description?: string;
    studentId?: string;
  }) => Promise<void> | void;
}

const POPULAR_SUGGESTIONS = [
  { title: 'Thủ Thư Lớp', icon: '📚', desc: 'Quản lý tủ sách lớp học, ghi chép mượn trả và phát động đọc sách 15 phút đầu giờ.' },
  { title: 'Phụ Trách Kỹ Thuật / Máy Chiếu', icon: '💻', desc: 'Bật/tắt máy chiếu, kết nối laptop giáo viên và bảo quản thiết bị điện tử của phòng học.' },
  { title: 'Quản Ca / Văn Nghệ', icon: '🎵', desc: 'Bắt nhịp bài hát đầu giờ, khởi động tiết mục văn nghệ và quản lý đội hình thể dục giữa giờ.' },
  { title: 'Cán Sự Tiếng Anh', icon: '🗣️', desc: 'Theo dõi việc học từ vựng, hỗ trợ các bạn luyện phát âm và chuẩn bị bài môn Ngoại ngữ.' },
  { title: 'Phụ Trách Môi Trường & Cây Xanh', icon: '🌱', desc: 'Chăm sóc chậu cây cảnh lớp học, kiểm tra phân loại rác và giữ cảnh quan lớp học xanh mát.' },
  { title: 'Cán Sự Thể Dục & Thể Thao', icon: '🏃', desc: 'Tập hợp đội hình thể dục, kiểm tra trang phục thể thao và hỗ trợ tổ chức giải bóng đá/cầu lông.' },
  { title: 'Phụ Trách Phát Thanh & Báo Tường', icon: '📢', desc: 'Viết bài phát thanh măng non, trang trí báo tường các dịp lễ 20/11 và 26/3.' },
];

const EMOJI_OPTIONS = ['📚', '💻', '🎵', '🗣️', '🌱', '🏃', '📢', '🎨', '🔬', '⭐', '🛡️', '🔔', '📸', '📝', '⚡', '🏆'];

export const AddCustomRoleModal: React.FC<AddCustomRoleModalProps> = ({
  isOpen,
  onClose,
  allStudents,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('📚');
  const [description, setDescription] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleApplySuggestion = (sugg: typeof POPULAR_SUGGESTIONS[0]) => {
    setTitle(sugg.title);
    setIcon(sugg.icon);
    setDescription(sugg.desc);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên chức danh hoặc nhiệm vụ!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        icon,
        description: description.trim(),
        studentId: selectedStudentId || undefined,
      });
      // Reset form
      setTitle('');
      setIcon('📚');
      setDescription('');
      setSelectedStudentId('');
      setError('');
      onClose();
    } catch (err) {
      console.error('Lỗi khi thêm nhiệm vụ mới:', err);
      setError('Đã xảy ra lỗi khi tạo nhiệm vụ. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✨ Thêm Chức Danh / Nhiệm Vụ Mới Cho Lớp"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        {/* 1. Gợi ý 1 chạm nhanh */}
        <div>
          <label className="text-xs font-black text-slate-700 uppercase tracking-wide block mb-1.5">
            Gợi ý nhiệm vụ thường gặp (Bấm để chọn nhanh):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SUGGESTIONS.map((sugg) => (
              <button
                key={sugg.title}
                type="button"
                onClick={() => handleApplySuggestion(sugg)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  title === sugg.title
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{sugg.icon}</span>
                <span>{sugg.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Nhập tên nhiệm vụ & Chọn biểu tượng */}
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-3">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wide block mb-1">
              Tên chức danh / nhiệm vụ: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="VD: Thủ thư lớp, Phụ trách máy chiếu..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-850 focus:border-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 uppercase tracking-wide block mb-1">
              Biểu tượng:
            </label>
            <div className="relative">
              <div className="w-full h-[42px] rounded-xl border border-slate-300 bg-slate-50 flex items-center justify-center text-2xl">
                {icon}
              </div>
            </div>
          </div>
        </div>

        {/* Bảng chọn Emoji */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 block mb-1">Chọn biểu tượng đại diện:</span>
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
            {EMOJI_OPTIONS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setIcon(em)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-transform hover:scale-110 cursor-pointer ${
                  icon === em ? 'bg-white shadow-xs ring-2 ring-primary' : 'hover:bg-slate-200'
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Phân công học sinh đảm nhiệm */}
        <div>
          <label className="text-xs font-black text-slate-700 uppercase tracking-wide block mb-1">
            Phân công học sinh đảm nhiệm (Có thể chọn sau):
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:border-primary outline-none"
          >
            <option value="">-- Để trống (Chưa phân công) --</option>
            {allStudents.map((stu) => (
              <option key={stu.id} value={stu.id}>
                {stu.fullName} ({stu.groupName || 'Tổ'} • {stu.classRole || 'Thành viên'})
              </option>
            ))}
          </select>
        </div>

        {/* 4. Mô tả nhiệm vụ */}
        <div>
          <label className="text-xs font-black text-slate-700 uppercase tracking-wide block mb-1">
            Mô tả trách nhiệm & công việc tự quản:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Ghi chú ngắn gọn trách nhiệm của học sinh khi giữ chức vụ này..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:border-primary outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            className="text-xs font-black shadow-md shadow-primary/20"
          >
            {isSubmitting ? 'Đang lưu...' : '💾 Lưu & Thêm Vào Ban Cán Sự'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
