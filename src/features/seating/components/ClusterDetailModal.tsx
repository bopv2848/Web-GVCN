import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import type { InfectionCluster } from '../../../types/seating';

interface ClusterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clusters: InfectionCluster[];
  onOpenMedicalReport?: () => void;
}

export const ClusterDetailModal: React.FC<ClusterDetailModalProps> = ({
  isOpen,
  onClose,
  clusters,
  onOpenMedicalReport,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cụm Lây Nhiễm Bàn Học & Phương Án Giãn Cách"
      size="lg"
    >
      <div className="space-y-4 text-xs text-slate-800">
        {/* Banner tóm tắt */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <h4 className="font-black text-sm text-rose-900 uppercase">
              Phát Hiện {clusters.length} Cụm Bàn Học Có Nguy Cơ Lây Nhiễm Giọt Bắn Cao!
            </h4>
            <p className="mt-1 text-xs text-rose-800 leading-relaxed">
              Các học sinh ngồi cùng một bàn hoặc ngay trước/sau nhau cùng có biểu hiện ốm sốt theo mùa. GVCN cần can thiệp giãn cách ngay để cắt đứt chuỗi lây truyền trong lớp.
            </p>
          </div>
        </div>

        {/* Danh sách từng cụm bàn học */}
        <div className="space-y-3">
          {clusters.map((cluster, idx) => (
            <div
              key={cluster.clusterId}
              className="p-4 bg-white rounded-2xl border-2 border-rose-300 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-rose-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  Cụm {idx + 1}: {cluster.deskLabel}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                  {cluster.riskLevel === 'high' ? 'Nguy Cơ Cao (Cùng Bàn)' : 'Nguy Cơ Trung Bình'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                {/* Học sinh đang ốm */}
                <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200">
                  <span className="font-bold text-rose-900 block mb-1">
                    🔴 Học sinh đang nghỉ ốm sốt ({cluster.sickStudentNames.length} em):
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-rose-800 font-medium">
                    {cluster.sickStudentNames.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>

                {/* Bạn ngồi cạnh nguy cơ */}
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                  <span className="font-bold text-amber-900 block mb-1">
                    ⚠️ Học sinh ngồi cạnh cần giãn cách ({cluster.neighborAtRiskNames.length} em):
                  </span>
                  {cluster.neighborAtRiskNames.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-0.5 text-amber-900 font-medium">
                      {cluster.neighborAtRiskNames.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 italic text-[10px]">Không có bạn ngồi trước/sau</p>
                  )}
                </div>
              </div>

              {/* Đề xuất hành động */}
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center gap-1.5">
                <span className="font-bold text-slate-800">🛡️ Hành động:</span>
                <span>Tạm thời di chuyển các bạn ngồi cạnh sang các ghế trống ở dãy đối diện; lau khử khuẩn bàn học này.</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Đóng
          </Button>

          {onOpenMedicalReport && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                onOpenMedicalReport();
              }}
              className="text-xs font-black"
            >
              🚨 MỞ PHIẾU BÁO CÁO Y TẾ TRƯỜNG
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
