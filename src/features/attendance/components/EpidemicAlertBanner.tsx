import React, { useState } from 'react';
import type { EpidemicAlert } from '../../../types/attendance';
import { Button } from '../../../components/common/Button';

interface EpidemicAlertBannerProps {
  alert: EpidemicAlert | null;
  onOpenReport: () => void;
}

export const EpidemicAlertBanner: React.FC<EpidemicAlertBannerProps> = ({
  alert,
  onOpenReport,
}) => {
  const [showChecklist, setShowChecklist] = useState<boolean>(false);

  if (!alert || alert.level === 'none' || alert.sickStudentCount < 3) {
    return null;
  }

  const isCritical = alert.level === 'critical';

  return (
    <div
      className={`rounded-3xl p-5 md:p-6 text-white transition-all shadow-lg print:hidden ${
        isCritical
          ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 shadow-rose-600/25 border-2 border-rose-400/50'
          : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 shadow-amber-500/20 border-2 border-amber-300/40'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          {/* Tag tiêu đề cảnh báo */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs border border-white/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>{isCritical ? '🚨 Báo Động Đỏ Y Tế' : '🟡 Cảnh Báo Sớm Dịch Bệnh'}</span>
            </span>

            <span className="text-xs font-bold text-white/90">
              Khung 7 ngày: {alert.startDate.slice(8, 10)}/{alert.startDate.slice(5, 7)} —{' '}
              {alert.endDate.slice(8, 10)}/{alert.endDate.slice(5, 7)}
            </span>
          </div>

          {/* Tiêu đề & Thông điệp hành động */}
          <div>
            <h3 className="text-base md:text-lg font-black tracking-tight flex items-center gap-2">
              <span>{isCritical ? '⚠️ Nguy Cơ Dịch Bệnh Bùng Phát:' : 'Cảnh Báo:'}</span>
              <span>{alert.sickStudentCount} Học Sinh Nghỉ Ốm Sốt / Cảm Cúm Trong Tuần!</span>
            </h3>

            <p className="text-xs text-white/90 mt-1 leading-relaxed max-w-3xl">
              {isCritical
                ? 'Số ca ốm vượt ngưỡng an toàn (≥ 4 em)! Đề xuất Thầy báo ngay cho Cán bộ Y tế học đường và Ban Giám Hiệu để tiến hành phun khử khuẩn Cloramin B toàn bộ phòng học lớp 6A6 sau giờ tan học.'
                : 'Phát hiện 3 học sinh có dấu hiệu ốm sốt theo mùa. Đề xuất Thầy nhắc nhở học sinh đeo khẩu trang, uống nước ấm và theo dõi sát thân nhiệt các em cùng tổ.'}
            </p>
          </div>

          {/* Danh sách học sinh đang nghỉ ốm */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-white/80">Học sinh ghi nhận:</span>
            {alert.sickStudents.map((st) => (
              <span
                key={st.studentId}
                className="px-2.5 py-1 rounded-xl bg-white/20 backdrop-blur-xs text-[11px] font-black border border-white/30 flex items-center gap-1"
                title={`Ngày nghỉ: ${st.dates.join(', ')} | Triệu chứng: ${st.reasons.join('; ')}`}
              >
                <span>🤒</span>
                <span>{st.studentName}</span>
                <span className="text-[10px] font-normal opacity-80">({st.groupName})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Nút hành động cho GVCN */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
          <Button
            type="button"
            variant="accent"
            size="md"
            onClick={onOpenReport}
            className="text-xs font-black shadow-md shadow-black/20 text-slate-950 bg-white hover:bg-slate-100 border-none justify-center"
          >
            🚨 BÁO CÁO Y TẾ & KHỬ KHUẨN
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setShowChecklist((prev) => !prev)}
            className="text-xs font-bold text-white border-white/40 hover:bg-white/15 justify-center"
          >
            🛡️ {showChecklist ? 'Ẩn Quy Trình Phòng Dịch' : 'Xem Quy Trình Khử Khuẩn'}
          </Button>
        </div>
      </div>

      {/* Khung hướng dẫn quy trình phòng dịch 4 bước (Hiển thị khi bấm) */}
      {showChecklist && (
        <div className="mt-4 pt-4 border-t border-white/25 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-black/20 rounded-2xl p-3 backdrop-blur-xs border border-white/20">
            <span className="font-black text-amber-200 block text-[11px] mb-1">Bước 1: Thông Thoáng Khí</span>
            <p className="text-[11px] text-white/90">
              Mở toàn bộ cửa sổ và cửa ra vào lớp 6A6 đón gió và ánh nắng tự nhiên; hạn chế đóng kín bật điều hòa.
            </p>
          </div>

          <div className="bg-black/20 rounded-2xl p-3 backdrop-blur-xs border border-white/20">
            <span className="font-black text-amber-200 block text-[11px] mb-1">Bước 2: Đo Thân Nhiệt</span>
            <p className="text-[11px] text-white/90">
              Cán bộ Y tế hoặc Lớp trưởng đo nhiệt kế trán 15 phút đầu giờ truy bài; nếu phát hiện em nào sốt &gt; 37.5°C thì xuống phòng Y tế nghỉ ngơi.
            </p>
          </div>

          <div className="bg-black/20 rounded-2xl p-3 backdrop-blur-xs border border-white/20">
            <span className="font-black text-amber-200 block text-[11px] mb-1">Bước 3: Vệ Sinh Cá Nhân</span>
            <p className="text-[11px] text-white/90">
              Phát khẩu trang y tế cho học sinh toàn lớp; nhắc các em sát khuẩn tay trước khi vào lớp và sau giờ ra chơi.
            </p>
          </div>

          <div className="bg-black/20 rounded-2xl p-3 backdrop-blur-xs border border-white/20">
            <span className="font-black text-amber-200 block text-[11px] mb-1">Bước 4: Phun Khử Khuẩn</span>
            <p className="text-[11px] text-white/90">
              Lao công y tế phun hóa chất Cloramin B hoặc cồn 70 độ lau sạch mặt bàn, ghế, tay nắm cửa sau 17h00 tan trường.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
