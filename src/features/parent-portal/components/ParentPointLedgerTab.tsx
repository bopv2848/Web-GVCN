import React, { useState, useMemo } from 'react';
import type { ParentStudentPortalData } from '../types';

interface ParentPointLedgerTabProps {
  data: ParentStudentPortalData;
}

export const ParentPointLedgerTab: React.FC<ParentPointLedgerTabProps> = ({ data }) => {
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all');
  const { pointTransactions } = data;

  const filteredTransactions = useMemo(() => {
    return pointTransactions.filter((t) => {
      if (filterType === 'positive') return t.points > 0;
      if (filterType === 'negative') return t.points < 0;
      return true;
    });
  }, [pointTransactions, filterType]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString('vi-VN')} lúc ${d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } catch {
      return iso;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-black text-slate-850 tracking-tight flex items-center gap-2">
            <span>⭐</span> Sổ Cái Điểm Thi Đua & Nề Nếp
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Chi tiết các việc tốt được tuyên dương và các lỗi nề nếp cần phối hợp nhắc nhở
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-white text-slate-850 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất cả ({pointTransactions.length})
          </button>
          <button
            onClick={() => setFilterType('positive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'positive'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Khen thưởng
          </button>
          <button
            onClick={() => setFilterType('negative')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'negative'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Cần nhắc nhở
          </button>
        </div>
      </div>

      {/* Transactions list */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs italic">
          Không có bản ghi nào trong mục này.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
          {filteredTransactions.map((tx) => (
            <div key={tx.id} className="py-3 flex items-start justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-black ${
                      tx.points > 0
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {tx.points > 0 ? `+${tx.points}` : tx.points} điểm
                  </span>
                  {tx.stars > 0 && (
                    <span className="text-amber-600 font-bold text-[11px]">
                      ⭐ +{tx.stars} sao
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {formatDate(tx.occurredAt)}
                  </span>
                </div>

                <p className="font-bold text-slate-800 text-[12.5px]">{tx.reason}</p>
                {tx.note && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                    Chi tiết: "{tx.note}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
