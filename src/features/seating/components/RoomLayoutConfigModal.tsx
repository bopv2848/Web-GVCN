import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../../components/common/Button';
import type {
  ClassroomElementsConfig,
  TeacherDeskPosition,
  DoorPosition,
} from '../../../types/seating';
import { seatingDimensionUtils } from '../utils/seatingDimensionUtils';

interface RoomLayoutConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRows: number;
  currentCols: number;
  totalStudents: number;
  elementsConfig?: ClassroomElementsConfig;
  onSave: (newRows: number, newCols: number) => Promise<void>;
  onSaveElementsConfig?: (updates: Partial<ClassroomElementsConfig>) => void;
}

export const RoomLayoutConfigModal: React.FC<RoomLayoutConfigModalProps> = ({
  isOpen,
  onClose,
  currentRows,
  currentCols,
  totalStudents,
  elementsConfig,
  onSave,
  onSaveElementsConfig,
}) => {
  // Số dãy bàn đôi: 3 dãy (6 cột) hoặc 4 dãy (8 cột)
  const [aislesCount, setAislesCount] = useState<3 | 4>(
    currentCols === 6 ? 3 : 4
  );
  // Số bàn mỗi dãy: từ 4 đến 7 bàn
  const [rowsCount, setRowsCount] = useState<number>(currentRows || 6);
  // Vị trí Bàn Giáo Viên
  const [deskPosition, setDeskPosition] = useState<TeacherDeskPosition>(
    elementsConfig?.teacherDeskPosition || 'right'
  );
  // Vị trí Cửa Ra Vào
  const [doorPos, setDoorPos] = useState<DoorPosition>(
    elementsConfig?.doorPosition || 'right'
  );
  // Góc xoay Mũi tên Cửa Ra Vào (0 - 360)
  const [doorAngle, setDoorAngle] = useState<number>(
    elementsConfig?.doorAngle ?? 180
  );
  // Kích thước Bàn Giáo Viên (Dài/Ngắn & To/Nhỏ)
  const [teacherDeskWidth, setTeacherDeskWidth] = useState<number>(
    elementsConfig?.teacherDeskWidth ?? 384
  );
  const [teacherDeskScale, setTeacherDeskScale] = useState<number>(
    elementsConfig?.teacherDeskScale ?? 100
  );
  // Kích thước Cửa Ra Vào (Dài/Ngắn & To/Nhỏ)
  const [doorWidth, setDoorWidth] = useState<number>(
    elementsConfig?.doorWidth ?? 180
  );
  const [doorScale, setDoorScale] = useState<number>(
    elementsConfig?.doorScale ?? 100
  );
  // Kích thước Bàn Học Sinh (To/Nhỏ)
  const [studentDeskScale, setStudentDeskScale] = useState<number>(
    elementsConfig?.studentDeskScale ?? 100
  );
  // Khóa kích thước bàn và cửa
  const [isDimensionsLocked, setIsDimensionsLocked] = useState<boolean>(
    elementsConfig?.isDimensionsLocked ?? false
  );
  // Vị trí Bục giảng & Bảng: Phía Trên hoặc Phía Dưới
  const [frontPlacement, setFrontPlacement] = useState<'top' | 'bottom'>(
    elementsConfig?.frontPlacement || 'bottom'
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setAislesCount(currentCols === 6 ? 3 : 4);
      setRowsCount(currentRows || 6);
      if (elementsConfig) {
        setDeskPosition(elementsConfig.teacherDeskPosition);
        setDoorPos(elementsConfig.doorPosition);
        setDoorAngle(elementsConfig.doorAngle);
        setTeacherDeskWidth(elementsConfig.teacherDeskWidth ?? 384);
        setTeacherDeskScale(elementsConfig.teacherDeskScale ?? 100);
        setDoorWidth(elementsConfig.doorWidth ?? 180);
        setDoorScale(elementsConfig.doorScale ?? 100);
        setStudentDeskScale(elementsConfig.studentDeskScale ?? 100);
        setIsDimensionsLocked(elementsConfig.isDimensionsLocked ?? false);
        setFrontPlacement(elementsConfig.frontPlacement || 'bottom');
      }
    }
  }, [isOpen, currentCols, currentRows, elementsConfig]);

  const totalDesks = useMemo(() => aislesCount * rowsCount, [aislesCount, rowsCount]);
  const totalCapacity = useMemo(() => totalDesks * 2, [totalDesks]);
  const isShortage = totalCapacity < totalStudents;
  const shortageCount = totalStudents - totalCapacity;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newCols = aislesCount * 2;
      await onSave(rowsCount, newCols);
      if (onSaveElementsConfig) {
        onSaveElementsConfig({
          teacherDeskPosition: deskPosition,
          doorPosition: doorPos,
          doorAngle: doorAngle,
          teacherDeskWidth,
          teacherDeskScale,
          doorWidth,
          doorScale,
          studentDeskScale,
          isDimensionsLocked,
          frontPlacement,
        });
      }
      onClose();
    } catch (err) {
      console.error('Lỗi lưu cấu hình phòng học:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn print:hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tiêu đề Modal */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-xl shadow-xs">
              🏛️
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Cấu Hình Không Gian Phòng Học
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tùy biến số dãy và số bàn theo phòng học thực tế của trường
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Chọn Số Dãy Bàn Học */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              1. Số Dãy Bàn Đôi Trong Lớp
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAislesCount(3)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  aislesCount === 3
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-400/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm text-slate-900">3 Dãy (6 Cột)</span>
                  {aislesCount === 3 && (
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                  Phù hợp phòng học vừa hoặc chia 3 tổ
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAislesCount(4)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  aislesCount === 4
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-400/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm text-slate-900">4 Dãy (8 Cột)</span>
                  {aislesCount === 4 && (
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                  Chuẩn truyền thống (4 Tổ thi đua)
                </p>
              </button>
            </div>
          </div>

          {/* 2. Chọn Số Bàn Mỗi Dãy */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              2. Số Bàn Mỗi Dãy (Số Hàng)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRowsCount(num)}
                  className={`py-2.5 px-3 rounded-2xl border font-black text-xs transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                    rowsCount === num
                      ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-400/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                  }`}
                >
                  <span className="text-sm">{num} Bàn</span>
                  <span className="text-[10px] font-semibold opacity-70">
                    {num * 2} chỗ/dãy
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Chọn Vị Trí Bàn Giáo Viên */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              3. Vị Trí Bàn Giáo Viên (Phía Trước Bảng)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'left', label: '⬅ Bên Trái', desc: 'Sát dãy phía trái' },
                { id: 'center', label: '⏺ Ở Giữa', desc: 'Trung tâm trước bảng' },
                { id: 'right', label: 'Bên Phải ➡', desc: 'Sát dãy phía phải' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDeskPosition(item.id as TeacherDeskPosition)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    deskPosition === item.id
                      ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-400/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                  }`}
                >
                  <div className="font-black text-xs">{item.label}</div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Cấu Hình Cửa Ra Vào (Vị Trí & Hướng Mũi Tên Xoay 360°) */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-blue-950 uppercase tracking-wider block">
                4. Cửa Ra Vào Phòng Học
              </label>
              <span className="text-[11px] font-black text-blue-700">
                Góc xoay: {doorAngle}°
              </span>
            </div>

            {/* Chọn vị trí cửa (Trái hoặc Phải) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDoorPos('left')}
                className={`py-2 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  doorPos === 'left'
                    ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <span>🚪</span>
                <span>Hành Lang Bên Trái</span>
              </button>

              <button
                type="button"
                onClick={() => setDoorPos('right')}
                className={`py-2 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  doorPos === 'right'
                    ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <span>🚪</span>
                <span>Hành Lang Bên Phải</span>
              </button>
            </div>

            {/* Hướng Mũi Tên Xoay 360 độ */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span>Hướng mũi tên chỉ cửa vào:</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs transition-transform duration-200"
                    style={{ transform: `rotate(${doorAngle}deg)` }}
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                    </svg>
                  </div>
                  <span className="text-blue-900 font-black">{doorAngle}°</span>
                </div>
              </div>

              {/* Slider 0 - 360 */}
              <input
                type="range"
                min="0"
                max="359"
                step="5"
                value={doorAngle}
                onChange={(e) => setDoorAngle(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              {/* Nút góc chuẩn */}
              <div className="grid grid-cols-4 gap-1 pt-0.5">
                {[
                  { label: '⬆ 0° (Lên)', a: 0 },
                  { label: '➡ 90° (Phải)', a: 90 },
                  { label: '⬇ 180° (Xuống)', a: 180 },
                  { label: '⬅ 270° (Trái)', a: 270 },
                ].map((item) => (
                  <button
                    key={item.a}
                    type="button"
                    onClick={() => setDoorAngle(item.a)}
                    className={`py-1 rounded-lg text-[10px] font-bold text-center cursor-pointer transition-all ${
                      doorAngle === item.a
                        ? 'bg-blue-600 text-white shadow-2xs font-black'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Thanh Trượt Tùy Chỉnh Kích Thước Bàn & Cửa Ra Vào (Dài/Ngắn, To/Nhỏ) */}
          <div className="space-y-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">📏</span>
                <label className="text-xs font-black text-amber-950 uppercase tracking-wider block">
                  5. Kích Thước Bàn & Cửa Ra Vào
                </label>
              </div>
              <button
                type="button"
                disabled={isDimensionsLocked}
                onClick={() => {
                  setTeacherDeskWidth(384);
                  setTeacherDeskScale(100);
                  setDoorWidth(180);
                  setDoorScale(100);
                  setStudentDeskScale(100);
                }}
                className={`text-[10px] font-bold ${
                  isDimensionsLocked
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-amber-800 hover:text-amber-950 hover:underline cursor-pointer'
                }`}
                title="Đặt lại kích thước chuẩn ban đầu"
              >
                ↺ Đặt lại chuẩn
              </button>
            </div>

            {/* Nút Gạt Khóa Kích Thước (Lock Dimensions Switch) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/90 border border-amber-200/80 shadow-2xs">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <span>{isDimensionsLocked ? '🔒' : '🔓'}</span>
                  <span>Khóa Kích Thước (Lock Dimensions)</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  {isDimensionsLocked
                    ? 'Cố định kích thước bàn & cửa để tránh vô tình chạm kéo nhầm khi dùng trên điện thoại'
                    : 'Đang mở khóa để tùy chỉnh kích thước bàn, cửa và độ to bàn học sinh'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isDimensionsLocked}
                onClick={() => setIsDimensionsLocked((prev) => !prev)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer shrink-0 ${
                  isDimensionsLocked ? 'bg-rose-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
                title={isDimensionsLocked ? 'Bấm để Mở Khóa' : 'Bấm để Khóa Cố Định'}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
              </button>
            </div>

            {/* Banner cảnh báo khi đã khóa */}
            {isDimensionsLocked && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <span>🔒</span>
                <span>Kích thước đang được khóa cố định. Gạt công tắc trên để mở khóa điều chỉnh!</span>
              </div>
            )}

            {/* Cụm A: BÀN GIÁO VIÊN */}
            <div className={`space-y-2.5 bg-white/80 p-3 rounded-xl border border-amber-200/60 transition-opacity ${isDimensionsLocked ? 'opacity-70' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <span>🪑</span> Bàn Giáo Viên:
                </span>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                    Dài: {teacherDeskWidth}px
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                    Cỡ: {teacherDeskScale}%
                  </span>
                </div>
              </div>

              {/* Thanh trượt Chiều dài (Dài - Ngắn) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 flex-wrap gap-1">
                  <span>Chiều dài bàn (Dài ↔ Ngắn):</span>
                  <span className="text-amber-900 font-black">
                    {teacherDeskWidth}px{' '}
                    <span className="text-[10px] font-semibold text-amber-700">
                      ({seatingDimensionUtils.formatTeacherDesk(teacherDeskWidth, teacherDeskScale)})
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="240"
                  max="560"
                  step="10"
                  value={teacherDeskWidth}
                  disabled={isDimensionsLocked}
                  onChange={(e) => setTeacherDeskWidth(parseInt(e.target.value, 10))}
                  className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none accent-amber-600 ${
                    isDimensionsLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Ngắn (240px ≈ 1.0m)</span>
                  <span>Chuẩn (384px ≈ 1.6m)</span>
                  <span>Dài (560px ≈ 2.3m)</span>
                </div>
              </div>

              {/* Thanh trượt Kích thước (To - Nhỏ) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Tỷ lệ to/nhỏ bàn:</span>
                  <span className="text-amber-900 font-black">{teacherDeskScale}%</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="135"
                  step="5"
                  value={teacherDeskScale}
                  disabled={isDimensionsLocked}
                  onChange={(e) => setTeacherDeskScale(parseInt(e.target.value, 10))}
                  className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none accent-amber-600 ${
                    isDimensionsLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Nhỏ (75%)</span>
                  <span>Chuẩn (100%)</span>
                  <span>To (135%)</span>
                </div>
              </div>
            </div>

            {/* Cụm B: CỬA RA VÀO */}
            <div className={`space-y-2.5 bg-white/80 p-3 rounded-xl border border-blue-200/60 transition-opacity ${isDimensionsLocked ? 'opacity-70' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <span>🚪</span> Cửa Ra Vào:
                </span>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
                    Dài: {doorWidth}px
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
                    Cỡ: {doorScale}%
                  </span>
                </div>
              </div>

              {/* Thanh trượt Chiều dài Cửa (Dài - Ngắn) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 flex-wrap gap-1">
                  <span>Chiều dài cánh cửa (Dài ↔ Ngắn):</span>
                  <span className="text-blue-900 font-black">
                    {doorWidth}px{' '}
                    <span className="text-[10px] font-semibold text-blue-700">
                      ({seatingDimensionUtils.formatDoor(doorWidth, doorScale)})
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="320"
                  step="10"
                  value={doorWidth}
                  disabled={isDimensionsLocked}
                  onChange={(e) => setDoorWidth(parseInt(e.target.value, 10))}
                  className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none accent-blue-600 ${
                    isDimensionsLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Gọn (120px ≈ 0.6m)</span>
                  <span>Chuẩn (180px ≈ 0.9m)</span>
                  <span>Rộng (320px ≈ 1.6m)</span>
                </div>
              </div>

              {/* Thanh trượt Kích thước Cửa (To - Nhỏ) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Tỷ lệ to/nhỏ cửa:</span>
                  <span className="text-blue-900 font-black">{doorScale}%</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="135"
                  step="5"
                  value={doorScale}
                  disabled={isDimensionsLocked}
                  onChange={(e) => setDoorScale(parseInt(e.target.value, 10))}
                  className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none accent-blue-600 ${
                    isDimensionsLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Nhỏ (75%)</span>
                  <span>Chuẩn (100%)</span>
                  <span>To (135%)</span>
                </div>
              </div>
            </div>

            {/* Cụm C: BÀN HỌC SINH CẢ LỚP */}
            <div className={`space-y-2 bg-white/80 p-3 rounded-xl border border-slate-200 transition-opacity ${isDimensionsLocked ? 'opacity-70' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <span>🏫</span> Bàn Học Sinh:
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-900 border border-slate-200 text-[10px] font-bold">
                  {studentDeskScale}%{' '}
                  <span className="text-[10px] font-semibold text-slate-500">
                    ({seatingDimensionUtils.formatStudentDesk(studentDeskScale)})
                  </span>
                </span>
              </div>
              <div className="space-y-1">
                <input
                  type="range"
                  min="80"
                  max="125"
                  step="5"
                  value={studentDeskScale}
                  disabled={isDimensionsLocked}
                  onChange={(e) => setStudentDeskScale(parseInt(e.target.value, 10))}
                  className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none accent-slate-700 ${
                    isDimensionsLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Nhỏ gọn (80%)</span>
                  <span>Chuẩn (100%)</span>
                  <span>Phóng to (125%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Tóm Tắt Sức Chứa & Mini Preview */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Sức chứa phòng học:</span>
              <span className="font-black text-slate-900">
                {aislesCount} Dãy × {rowsCount} Bàn ={' '}
                <span className="text-blue-700 text-sm font-black">{totalCapacity} Chỗ ngồi</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-slate-200/60 pt-2">
              <span className="font-bold text-slate-600">Sĩ số lớp thực tế:</span>
              <span className="font-bold text-slate-800">{totalStudents} Học sinh</span>
            </div>

            {/* Cảnh báo thừa/thiếu chỗ */}
            {isShortage ? (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                <span className="text-base leading-none">⚠️</span>
                <div>
                  <span className="font-bold">Thiếu {shortageCount} chỗ ngồi:</span> Lớp có {totalStudents} em nhưng phòng chỉ có {totalCapacity} chỗ. {shortageCount} em vượt quá sẽ được chuyển về <b>Khay Ghế Chờ</b> ở cuối trang (không mất dữ liệu).
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] flex items-center gap-2">
                <span>✅</span>
                <span>
                  Đủ chỗ ngồi cho toàn bộ {totalStudents} học sinh (Dư {totalCapacity - totalStudents} ghế trống).
                </span>
              </div>
            )}

            {/* Mini Grid Preview */}
            <div className="pt-2 border-t border-slate-200/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase text-center mb-1.5">
                Mô phỏng bố cục ({aislesCount} Dãy • {rowsCount} Hàng)
              </div>
              <div
                className="grid gap-1.5 p-2 bg-amber-100/40 rounded-xl border border-amber-200/60 max-w-[240px] mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${aislesCount}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: aislesCount }).map((_, aIdx) => (
                  <div key={aIdx} className="space-y-1">
                    {Array.from({ length: rowsCount }).map((_, rIdx) => (
                      <div
                        key={rIdx}
                        className="h-3 rounded-xs bg-amber-500/70 border border-amber-600/40 shadow-2xs"
                        title={`Dãy ${aIdx + 1} - Bàn ${rIdx + 1}`}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nút thao tác */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="font-black"
            >
              {isSubmitting ? 'Đang Lưu...' : '💾 Lưu Cấu Hình'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
