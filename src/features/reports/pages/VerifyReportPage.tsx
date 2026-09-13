import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, AlertTriangle, Calendar, User, School, Users, Award, ArrowLeft } from 'lucide-react';
import { reportVerificationService } from '../services/reportVerificationService';

export const VerifyReportPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const data = useMemo(() => {
    return reportVerificationService.parseVerificationParams(searchParams);
  }, [searchParams]);

  const formattedDate = useMemo(() => {
    if (!data?.signedAt) return '';
    try {
      const d = new Date(data.signedAt);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ngày ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return data.signedAt;
    }
  }, [data?.signedAt]);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Không Thể Xác Thực Văn Bản</h1>
          <p className="text-sm text-slate-600 mb-6">
            Mã QR hoặc liên kết tra cứu không chứa đầy đủ thông tin xác thực hợp lệ. Vui lòng kiểm tra lại mã trên văn bản in.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Quay Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        {/* Thẻ chứng nhận điện tử */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Header Xanh Chứng nhận */}
          <div className="bg-emerald-600 text-white p-6 text-center relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-full mb-3 shadow-inner">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700/60 rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Chứng Nhận Văn Bản Hợp Lệ & Nguyên Bản</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-wide">
              XÁC THỰC BÁO CÁO ĐIỆN TỬ
            </h1>
            <p className="text-emerald-100 text-xs mt-1">
              Dữ liệu được bảo chứng bởi Hệ thống Sổ chủ nhiệm số Web-GVCN 4.0
            </p>
          </div>

          {/* Nội dung chi tiết văn bản */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Thông tin đơn vị & Người ký */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex items-start gap-3">
                <School className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] uppercase font-bold text-slate-600">Đơn vị phát hành</div>
                  <div className="text-sm font-extrabold text-slate-800">{data.schoolName}</div>
                  <div className="text-xs text-slate-600">Lớp: <strong className="text-blue-700">{data.className}</strong></div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-slate-200">
                <User className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] uppercase font-bold text-slate-600">Giáo viên chủ nhiệm phụ trách</div>
                  <div className="text-sm font-bold text-slate-800">{data.teacherName}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-slate-200">
                <Calendar className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] uppercase font-bold text-slate-600">Kỳ báo cáo & Thời điểm ký</div>
                  <div className="text-sm font-semibold text-slate-800">{data.periodTitle}</div>
                  <div className="text-xs text-slate-600">{formattedDate}</div>
                </div>
              </div>
            </div>

            {/* Các chỉ số nòng cốt đã ký số */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Chỉ Số Gốc Được Ký Duyệt
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
                  <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <div className="text-lg font-black text-blue-900">{data.totalStudents}</div>
                  <div className="text-[11px] text-blue-700 font-medium">Sĩ số lớp</div>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <div className="text-lg font-black text-emerald-900">{data.attendanceRate}%</div>
                  <div className="text-[11px] text-emerald-700 font-medium">Chuyên cần</div>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-2xl">
                  <Award className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <div className="text-lg font-black text-amber-900">
                    {data.totalPoints > 0 ? `+${data.totalPoints}` : data.totalPoints}
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium">Điểm thi đua</div>
                </div>
              </div>
            </div>

            {/* Mã tra cứu & Cam kết chống giả mạo */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold">Mã định danh văn bản (Doc ID):</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {data.docId}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 italic leading-relaxed pt-1">
                🛡️ <strong>Lưu ý bảo mật:</strong> Văn bản giấy chỉ có giá trị khi các chỉ số và mã tra cứu trùng khớp 100% với dữ liệu hiển thị trên cổng xác thực điện tử chính thức này.
              </p>
            </div>

            {/* Nút điều hướng */}
            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition shadow-md"
              >
                Đăng Nhập Cổng Quản Lý GVCN
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-600 space-y-1">
          <p>© 2026 THCS Tân Hải • Hệ Thống Sổ Chủ Nhiệm Số 4.0</p>
          <p>Phát triển đồng hành cùng Giáo viên chủ nhiệm</p>
        </div>
      </div>
    </div>
  );
};
