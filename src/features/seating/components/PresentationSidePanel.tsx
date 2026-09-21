import React, { useState, useEffect } from 'react';

export interface SpinHistoryItem {
  id: string;
  studentId: string;
  studentName: string;
  groupName?: string;
  aisleName: string;
  deskNumber: number;
  time: string;
  awardedPoints?: number;
  assignedTask?: string;
}

export interface PresentationSidePanelProps {
  classId?: string;
  classNameTitle?: string;
  spinHistory: SpinHistoryItem[];
  onClearHistory: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export const NOTE_TEMPLATES = [
  {
    id: 'weekly',
    label: 'Thi đua tuần',
    icon: '🏆',
    content:
      '1. Đánh giá nề nếp & chuyên cần tuần qua:\n- Điểm mạnh: Trật tự đầu giờ, đồng phục nghiêm túc\n- Cần rút kinh nghiệm: Vệ sinh cuối buổi, trực nhật\n2. Tuyên dương Tổ xuất sắc & học sinh hoa điểm tốt\n3. Phổ biến kế hoạch học tập tuần tới:\n- Kiểm tra 15 phút môn Toán, Văn\n- Phát động phong trào thi đua tuần mới',
  },
  {
    id: 'union',
    label: 'Sinh hoạt Đội',
    icon: '🚩',
    content:
      '1. Triển khai kế hoạch công tác Đội Tuần mới\n2. Phân công đội viên trực cờ đỏ & bảo vệ môi trường\n3. Luyện tập bài ca múa hát sân trường & văn nghệ\n4. Dặn dò đoàn viên, đội viên giữ gìn tư cách gương mẫu',
  },
  {
    id: 'exam',
    label: 'Ôn thi & Kiểm tra',
    icon: '📚',
    content:
      '1. Lịch kiểm tra định kỳ & thi học kỳ các môn\n2. Phổ biến đề cương ôn tập trọng tâm các tổ\n3. Phân công đôi bạn cùng tiến giúp nhau học tập\n4. Dặn dò mang đầy đủ dụng cụ học tập & giữ gìn sức khỏe',
  },
];

export const PresentationSidePanel: React.FC<PresentationSidePanelProps> = ({
  classId = 'default',
  classNameTitle = 'Lớp Học',
  spinHistory,
  onClearHistory,
  onClose,
  isOpen,
}) => {
  const storageKey = `web_gvcn_presentation_notes_${classId}`;
  const customTemplatesKey = `web_gvcn_custom_note_templates_${classId}`;

  const [notes, setNotes] = useState<string>(() => {
    try {
      return localStorage.getItem(storageKey) || '';
    } catch {
      return '';
    }
  });
  const [copied, setCopied] = useState<boolean>(false);

  // Danh sách mẫu ghi chú riêng do Thầy tự lưu
  const [customTemplates, setCustomTemplates] = useState<
    Array<{ id: string; label: string; icon: string; content: string }>
  >(() => {
    try {
      const saved = localStorage.getItem(customTemplatesKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Tự động lưu ghi chú khi giáo viên nhập
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, notes);
    } catch {
      // ignore storage errors
    }
  }, [notes, storageKey]);

  const handleApplyTemplate = (templateContent: string) => {
    if (notes.trim()) {
      if (
        window.confirm(
          'Thầy có muốn thay thế nội dung hiện tại bằng mẫu này không?\n- Bấm OK: Thay thế hoàn toàn\n- Bấm Cancel: Nối tiếp vào cuối ghi chú'
        )
      ) {
        setNotes(templateContent);
      } else {
        setNotes((prev) => `${prev}\n\n--- Mẫu bổ sung ---\n${templateContent}`);
      }
    } else {
      setNotes(templateContent);
    }
  };

  // Lưu mẫu dặn dò riêng của Thầy vào máy tính
  const handleSaveCustomTemplate = () => {
    if (!notes.trim()) {
      alert('Vui lòng nhập nội dung ghi chú dặn dò trước khi lưu thành mẫu!');
      return;
    }

    const templateName = window.prompt(
      'Đặt tên cho mẫu dặn dò riêng của Thầy:',
      `Mẫu dặn dò ${customTemplates.length + 1}`
    );

    if (!templateName || !templateName.trim()) return;

    const newTemplate = {
      id: `custom_${Date.now()}`,
      label: templateName.trim(),
      icon: '📌',
      content: notes.trim(),
    };

    const nextTemplates = [...customTemplates, newTemplate];
    setCustomTemplates(nextTemplates);
    try {
      localStorage.setItem(customTemplatesKey, JSON.stringify(nextTemplates));
    } catch {
      // ignore
    }
  };

  // Xóa mẫu dặn dò riêng
  const handleDeleteCustomTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Thầy có chắc chắn muốn xóa mẫu dặn dò này không?')) {
      const nextTemplates = customTemplates.filter((t) => t.id !== id);
      setCustomTemplates(nextTemplates);
      try {
        localStorage.setItem(customTemplatesKey, JSON.stringify(nextTemplates));
      } catch {
        // ignore
      }
    }
  };

  if (!isOpen) return null;

  const handleCopyNotes = async () => {
    if (!notes.trim()) return;
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <aside
      aria-label="Bảng tiện ích tiết sinh hoạt lớp"
      className="w-64 sm:w-70 md:w-72 shrink-0 bg-slate-900/95 border-l-2 border-slate-700/80 flex flex-col h-full shadow-2xl backdrop-blur-md text-white z-40 animate-fade-in select-none"
    >
      {/* Tiêu đề thanh tiện ích */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-base">📋</span>
          <div>
            <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">
              Bảng Tiện Ích Sinh Hoạt
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              {classNameTitle} • Trực Tiếp
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-black cursor-pointer"
          title="Thu gọn bảng tiện ích"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 custom-scrollbar">
        {/* Tiện ích 1: Ghi chú dặn dò nhanh */}
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>📝 Dặn dò & Nội dung tiết sinh hoạt:</span>
            </span>
            {notes && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyNotes}
                  className="text-[10px] text-slate-400 hover:text-amber-300 font-bold cursor-pointer"
                  title="Sao chép nội dung dặn dò"
                >
                  {copied ? '✓ Đã chép' : 'Sao chép'}
                </button>
                <button
                  type="button"
                  onClick={() => setNotes('')}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                  title="Xóa trắng ghi chú"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>

          {/* Thanh nút bấm chèn mẫu gợi ý & mẫu riêng của Thầy */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-slate-400 font-bold">Mẫu gợi ý:</span>
            {NOTE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tmpl.content)}
                className="px-1.5 py-0.5 rounded-lg bg-slate-800/90 hover:bg-amber-400 hover:text-slate-950 text-slate-300 border border-slate-700 text-[9.5px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                title={`Chèn mẫu gợi ý: ${tmpl.label}`}
              >
                <span>{tmpl.icon}</span>
                <span>{tmpl.label}</span>
              </button>
            ))}

            {/* Các mẫu riêng do Thầy tự lưu */}
            {customTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="inline-flex items-center rounded-lg bg-slate-800/90 border border-amber-400/40 text-amber-300 text-[9.5px] font-bold shadow-2xs overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl.content)}
                  className="px-1.5 py-0.5 hover:bg-amber-400 hover:text-slate-950 transition-all cursor-pointer flex items-center gap-1"
                  title={`Chèn mẫu riêng: ${tmpl.label}`}
                >
                  <span>{tmpl.icon}</span>
                  <span>{tmpl.label}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteCustomTemplate(tmpl.id, e)}
                  className="px-1 py-0.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/80 cursor-pointer"
                  title="Xóa mẫu riêng này"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Nút lưu nội dung hiện tại thành mẫu riêng */}
            <button
              type="button"
              onClick={handleSaveCustomTemplate}
              className="px-1.5 py-0.5 rounded-lg bg-amber-400/20 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-400/50 text-[9.5px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Lưu nội dung đang soạn thành mẫu riêng của Thầy để dùng lại các tuần sau"
            >
              <span>💾</span>
              <span>Lưu Mẫu Riêng</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="1. Nhận xét nề nếp tuần qua&#10;2. Tuyên dương tổ xuất sắc&#10;3. Kế hoạch tuần tới: kiểm tra 15 phút, nộp tiền bảo hiểm...&#10;4. Dặn dò ôn tập..."
              className="w-full h-28 bg-slate-950/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none font-normal leading-relaxed"
            />
            <span className="absolute bottom-2 right-2.5 text-[9px] text-slate-500 font-mono">
              Tự động lưu
            </span>
          </div>
        </section>

        {/* Tiện ích 2: Lịch sử bốc thăm & Thưởng điểm */}
        <section className="space-y-2.5 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎲 Đã Bốc Thăm ({spinHistory.length}):</span>
            </span>

            {spinHistory.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                title="Xóa danh sách bốc thăm buổi học này để bắt đầu vòng mới"
              >
                Làm mới vòng
              </button>
            )}
          </div>

          {spinHistory.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 text-center space-y-1">
              <span className="text-2xl opacity-40">🎲</span>
              <p className="text-[11px] text-slate-500 font-medium">
                Chưa có học sinh nào được bốc thăm trong tiết này.
              </p>
              <p className="text-[10px] text-slate-600">
                Bấm nút <span className="text-amber-400 font-bold">🎲 Bốc Thăm</span> để gọi học sinh ngẫu nhiên.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {spinHistory.map((item, index) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black flex items-center justify-center shrink-0">
                      {spinHistory.length - index}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-100 truncate">
                        {item.studentName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Dãy {item.aisleName} • Bàn {item.deskNumber}
                        {item.groupName ? ` • ${item.groupName}` : ''}
                      </p>
                      {item.assignedTask && (
                        <div className="mt-0.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-bold">
                            <span>🎯</span>
                            <span className="truncate max-w-[150px]">{item.assignedTask}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                    {item.awardedPoints ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black">
                        +{item.awardedPoints}đ
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500">Đã gọi</span>
                    )}
                    <span className="text-[9px] text-slate-600 font-mono">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Chân cột: Gợi ý phím tắt */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Phím tắt:</span>
        <div className="flex items-center gap-2">
          <span><strong className="text-slate-400">R:</strong> Bốc thăm</span>
          <span><strong className="text-slate-400">T:</strong> Đếm giờ</span>
          <span><strong className="text-slate-400">ESC:</strong> Thoát</span>
        </div>
      </div>
    </aside>
  );
};
