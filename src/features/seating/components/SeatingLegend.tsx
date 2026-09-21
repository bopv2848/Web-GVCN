import React from 'react';

interface SeatingLegendProps {
  isMedicalMode: boolean;
  onToggleMedicalMode: () => void;
  totalSick: number;
  totalClusters: number;
  totalAtRisk: number;
  onOpenClusterModal: () => void;
}

export const SeatingLegend: React.FC<SeatingLegendProps> = ({
  isMedicalMode,
  onToggleMedicalMode,
  totalSick,
  totalClusters,
  totalAtRisk,
  onOpenClusterModal,
}) => {
  return (
    <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tiêu đề & Công tắc bật tắt chế độ giám sát y tế */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMedicalMode}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isMedicalMode ? 'bg-rose-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isMedicalMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>

          <div>
            <span className="text-xs font-black text-slate-850 uppercase tracking-wide flex items-center gap-1.5">
              <span>🩺 Chế Độ Giám Sát Y Tế & Dịch Bệnh</span>
              {isMedicalMode && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 animate-pulse">
                  Đang Bật
                </span>
              )}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isMedicalMode
                ? 'Đang hiển thị chấm đỏ ca ốm và khoanh vùng Cụm lây nhiễm liền kề trên sơ đồ lớp'
                : 'Bật để quét các vị trí bàn học có học sinh nghỉ ốm sốt và học sinh có nguy cơ lây nhiễm'}
            </p>
          </div>
        </div>

        {/* Cảnh báo nhanh nếu có cụm lây nhiễm */}
        {isMedicalMode && totalClusters > 0 && (
          <button
            type="button"
            onClick={onOpenClusterModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-black hover:bg-rose-100 transition-all cursor-pointer shadow-xs animate-pulse"
          >
            <span>🚨 Phát hiện {totalClusters} Cụm Lây Nhiễm!</span>
            <span className="underline text-[11px]">Xem giải pháp &gt;</span>
          </button>
        )}
      </div>

      {/* Bảng chú thích màu sắc & ký hiệu */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300"></span>
          <span className="text-slate-600 font-semibold">Chỗ ngồi bình thường</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
          <span className="text-rose-700 font-bold">
            🔴 Đang nghỉ ốm sốt ({totalSick} em)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-black text-[9px]">
            🚨 CỤM LÂY NHIỄM
          </span>
          <span className="text-rose-900 font-bold">
            ({totalClusters} cụm bàn)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400"></span>
          <span className="text-amber-800 font-bold">
            ⚠️ Ngồi cạnh F0 ({totalAtRisk} em)
          </span>
        </div>
      </div>
    </div>
  );
};
