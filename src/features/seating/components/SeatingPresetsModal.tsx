import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { SeatingPreset, SeatAssignmentWithStudent, ClassroomElementsConfig } from '../../../types/seating';

interface SeatingPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: SeatingPreset[];
  currentAssignments: SeatAssignmentWithStudent[];
  currentElementsConfig?: Partial<ClassroomElementsConfig>;
  onSaveCurrentAsPreset: (
    name: string,
    description: string,
    elementsConfig?: Partial<ClassroomElementsConfig>
  ) => Promise<void> | void;
  onApplyPreset: (preset: SeatingPreset) => void;
  onDeletePreset: (presetId: string) => Promise<void> | void;
  onUpdatePreset: (presetId: string, name: string, description: string) => Promise<void> | void;
}

export const SeatingPresetsModal: React.FC<SeatingPresetsModalProps> = ({
  isOpen,
  onClose,
  presets,
  currentAssignments,
  currentElementsConfig,
  onSaveCurrentAsPreset,
  onApplyPreset,
  onDeletePreset,
  onUpdatePreset,
}) => {
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [saveDimensions, setSaveDimensions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State chỉnh sửa trực tiếp bản mẫu
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) {
      setErrorMsg('Vui lòng nhập tên cho bản mẫu sơ đồ!');
      return;
    }

    if (currentAssignments.length === 0) {
      setErrorMsg('Sơ đồ hiện tại đang trống hoàn toàn, không có học sinh nào để lưu bản mẫu!');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      await onSaveCurrentAsPreset(
        presetName.trim(),
        presetDescription.trim(),
        saveDimensions ? currentElementsConfig : undefined
      );
      setPresetName('');
      setPresetDescription('');
    } catch {
      setErrorMsg('Không thể lưu bản mẫu lên Cloud. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmApply = (preset: SeatingPreset) => {
    const confirm = window.confirm(
      `Thầy có chắc chắn muốn áp dụng bản mẫu "${preset.name}" (${preset.assignments.length} vị trí)? Hệ thống sẽ tự động lưu lại bản sao để Thầy có thể Hoàn tác bất kỳ lúc nào.`
    );
    if (confirm) {
      onApplyPreset(preset);
      onClose();
    }
  };

  const handleConfirmDelete = async (preset: SeatingPreset) => {
    const confirm = window.confirm(
      `Thầy có chắc chắn muốn xóa bản mẫu "${preset.name}" khỏi Cloud Supabase và thiết bị này?`
    );
    if (confirm) {
      setDeletingId(preset.id);
      try {
        await onDeletePreset(preset.id);
      } catch {
        alert('Không thể xóa bản mẫu. Vui lòng thử lại!');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleStartEdit = (preset: SeatingPreset) => {
    setEditingPresetId(preset.id);
    setEditName(preset.name);
    setEditDescription(preset.description || '');
  };

  const handleCancelEdit = () => {
    setEditingPresetId(null);
    setEditName('');
    setEditDescription('');
  };

  const handleSaveEdit = async (presetId: string) => {
    if (!editName.trim()) {
      alert('Tên bản mẫu không được để trống!');
      return;
    }
    setIsUpdating(true);
    try {
      await onUpdatePreset(presetId, editName.trim(), editDescription.trim());
      setEditingPresetId(null);
    } catch {
      alert('Không thể cập nhật bản mẫu. Vui lòng thử lại!');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📑 Quản Lý Bản Mẫu Sơ Đồ Lớp (Seating Presets)">
      <div className="space-y-6 text-slate-850">
        {/* Giới thiệu tính năng */}
        <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1">
            <p className="font-bold flex items-center gap-1.5 text-blue-950">
              <span>💡</span>
              <span>Bản mẫu sơ đồ linh hoạt & Đồng bộ Cloud:</span>
            </p>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 shrink-0 w-fit">
              <span>☁️</span>
              <span>Supabase Cloud Sync</span>
            </span>
          </div>
          Lưu lại cấu trúc chỗ ngồi thành các bản mẫu dự phòng (như <em>Sơ đồ Ôn thi</em>, <em>Sơ đồ Học nhóm</em>, <em>Sơ đồ Sinh hoạt</em>) và tự động đồng bộ xuyên suốt mọi thiết bị của Thầy (máy tính trường, laptop, điện thoại cá nhân).
        </div>

        {/* 1. Form Lưu sơ đồ hiện tại thành bản mẫu mới */}
        <form onSubmit={handleSave} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              💾 Lưu Sơ Đồ Hiện Tại ({currentAssignments.length} học sinh)
            </h4>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Tên bản mẫu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={presetName}
                onChange={(e) => {
                  setPresetName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="VD: Sơ đồ ôn thi cuối kỳ, Sơ đồ học nhóm Tổ 1-2..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Mô tả / Ghi chú (Tùy chọn)
              </label>
              <input
                type="text"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="VD: Giãn cách bàn, tránh 2 bạn hay mất tập trung ngồi gần nhau"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
              />
            </div>

            {currentElementsConfig && (
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none text-slate-700">
                <input
                  type="checkbox"
                  checked={saveDimensions}
                  onChange={(e) => setSaveDimensions(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-bold flex items-center gap-1.5 flex-wrap">
                  <span>📐</span>
                  <span>Lưu kèm kích thước bàn & cửa hiện tại:</span>
                  <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md font-bold border border-amber-200">
                    Bàn {currentElementsConfig.teacherDeskWidth ?? 384}px ({currentElementsConfig.teacherDeskScale ?? 100}%) • Cửa {currentElementsConfig.doorWidth ?? 180}px
                  </span>
                </span>
              </label>
            )}
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-rose-600">⚠️ {errorMsg}</p>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving || !presetName.trim() || currentAssignments.length === 0}
              className="text-xs font-bold"
            >
              {isSaving ? '☁️ Đang lưu lên Cloud...' : '➕ Lưu Thành Bản Mẫu Cloud'}
            </Button>
          </div>
        </form>

        {/* 2. Danh sách bản mẫu đã lưu */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              📑 Danh Sách Bản Mẫu Đã Lưu ({presets.length})
            </h4>
          </div>

          {presets.length === 0 ? (
            <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 text-slate-400 space-y-1">
              <span className="text-2xl">📋</span>
              <p className="text-xs font-bold text-slate-600">Chưa có bản mẫu sơ đồ nào</p>
              <p className="text-[11px]">
                Hãy sắp xếp các vị trí bàn ưng ý rồi nhập tên vào ô phía trên để lưu bản mẫu đầu tiên!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {presets.map((preset) =>
                editingPresetId === preset.id ? (
                  <div
                    key={preset.id}
                    className="p-3.5 bg-sky-50/90 rounded-2xl border border-sky-300 shadow-xs space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-sky-950 flex items-center gap-1.5">
                        <span>✏️</span>
                        <span>Chỉnh Sửa Bản Mẫu</span>
                      </span>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                        {preset.assignments.length} chỗ ngồi
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Tên bản mẫu <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Tên bản mẫu..."
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Mô tả / Ghi chú
                        </label>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Mô tả / ghi chú..."
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="text-xs font-bold text-slate-600 border-slate-300 hover:bg-slate-100"
                      >
                        ✕ Hủy
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleSaveEdit(preset.id)}
                        disabled={isUpdating || !editName.trim()}
                        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
                      >
                        {isUpdating ? 'Đang lưu...' : '✓ Lưu Thay Đổi'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={preset.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-xs font-black text-slate-900">{preset.name}</h5>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {preset.assignments.length} chỗ ngồi
                        </span>
                        {preset.id.startsWith('preset-') ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            💾 Thiết bị
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                            ☁️ Cloud
                          </span>
                        )}
                        {preset.elementsConfig && (
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1"
                            title={`Bàn GV: ${preset.elementsConfig.teacherDeskWidth ?? 384}px, Cửa: ${preset.elementsConfig.doorWidth ?? 180}px`}
                          >
                            <span>📐</span>
                            <span>Kèm cỡ riêng ({preset.elementsConfig.teacherDeskWidth ?? 384}px)</span>
                          </span>
                        )}
                      </div>
                      {preset.description && (
                        <p className="text-[11px] text-slate-500 font-medium">
                          {preset.description}
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400 block">
                        Tạo lúc: {new Date(preset.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleConfirmApply(preset)}
                        className="text-xs font-bold whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                        title="Áp dụng bản mẫu này vào sơ đồ lớp"
                      >
                        ✓ Áp Dụng
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(preset)}
                        className="text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-100"
                        title="Đổi tên hoặc sửa mô tả bản mẫu này"
                      >
                        ✏️
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmDelete(preset)}
                        disabled={deletingId === preset.id}
                        className="text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
                        title="Xóa bản mẫu này"
                      >
                        {deletingId === preset.id ? '...' : '🗑️'}
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose} className="text-xs font-bold">
            ĐÓNG LẠI
          </Button>
        </div>
      </div>
    </Modal>
  );
};
