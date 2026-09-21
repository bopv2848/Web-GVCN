import React from 'react';
import { TeacherDesk2D } from './TeacherDesk2D';
import { ClassroomDoor2D } from './ClassroomDoor2D';
import type { ClassroomElementsConfig } from '../../../types/seating';

interface ClassroomFrontElements2DProps {
  elementsConfig?: ClassroomElementsConfig;
  onUpdateElementsConfig?: (updates: Partial<ClassroomElementsConfig>) => void;
  cleanClassName?: string;
  isInteractive?: boolean;
}

export const ClassroomFrontElements2D: React.FC<ClassroomFrontElements2DProps> = ({
  elementsConfig,
  onUpdateElementsConfig,
  cleanClassName,
  isInteractive = true,
}) => {
  return (
    <div className="w-full mx-auto space-y-3 text-center pt-6 border-t border-slate-200/90 mt-4">
      {/* CỬA RA VÀO (KÉO THẢ TRỰC TIẾP SANG TRÁI / PHẢI HOẶC BẤM XOAY HƯỚNG) */}
      <ClassroomDoor2D
        elementsConfig={elementsConfig}
        onUpdateElementsConfig={onUpdateElementsConfig}
        isInteractive={isInteractive}
      />

      {/* BÀN GIÁO VIÊN (KÉO THẢ, MŨI TÊN ◀ ▶, DOUBLE CLICK ĐỔI TÊN) */}
      <TeacherDesk2D
        elementsConfig={elementsConfig}
        onUpdateElementsConfig={onUpdateElementsConfig}
        isInteractive={isInteractive}
      />

      {/* BẢNG LỚP HỌC */}
      <div className="max-w-2xl mx-auto py-2.5 px-6 rounded-2xl bg-slate-800 text-white font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2">
        <span>🏫</span>
        <span>BẢNG LỚP HỌC{cleanClassName ? ` • ${cleanClassName}` : ''}</span>
      </div>
    </div>
  );
};
