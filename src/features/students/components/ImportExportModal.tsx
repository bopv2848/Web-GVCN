import React, { useState } from 'react';
import type { Student } from '../../../types/student';
import { excelParser, type ParsedExcelResult } from '../utils/excelParser';
import { studentService, type ImportResult } from '../services/studentService';
import { Button } from '../../../components/common/Button';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  students: Student[];
  classId: string;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  students,
  classId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedExcelResult | null>(null);
  const [strategy, setStrategy] = useState<'skip' | 'update'>('skip');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await excelParser.exportToExcel(students, '6A6');
    } catch (err) {
      console.error('Lỗi xuất Excel:', err);
      alert('Không thể xuất file Excel. Vui lòng thử lại sau!');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMessage('');
    setImportResult(null);
    try {
      const parsed = await excelParser.parseFile(selectedFile);
      setParsedResult(parsed);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Không thể đọc tệp Excel/CSV.');
      setParsedResult(null);
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedResult || parsedResult.validRows.length === 0) return;

    setIsProcessing(true);
    setErrorMessage('');
    try {
      const result = await studentService.batchImportStudents(
        classId,
        parsedResult.validRows,
        strategy
      );
      setImportResult(result);
      onSuccess();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Lỗi khi nhập dữ liệu vào cơ sở dữ liệu.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <h2 className="text-lg font-black text-slate-850">
            📊 Nhập / Xuất Danh Sách Học Sinh (Excel & CSV)
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Export Action Card */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-4 mb-6">
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Xuất danh sách hiện tại ({students.length} học sinh)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Tải tệp Excel .xlsx có định dạng chuẩn, điểm số và trạng thái phụ huynh.
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outline"
            size="sm"
            className="whitespace-nowrap font-bold"
          >
            {isExporting ? (
              <span className="flex items-center gap-1.5">
                <span className="animate-spin inline-block w-3 h-3 border-2 border-slate-700 border-t-transparent rounded-full" />
                Đang xuất...
              </span>
            ) : (
              '📥 Xuất Excel'
            )}
          </Button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl mb-4">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Import Result Notification */}
        {importResult ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-3xl font-black">
              ✓
            </div>
            <h3 className="text-base font-black text-slate-850">Hoàn Tất Nhập Dữ Liệu!</h3>
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                <span className="block text-lg font-black text-emerald-700">{importResult.inserted}</span>
                <span className="text-[10px] font-bold text-slate-500">Thêm mới</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <span className="block text-lg font-black text-primary">{importResult.updated}</span>
                <span className="text-[10px] font-bold text-slate-500">Cập nhật</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
                <span className="block text-lg font-black text-amber-700">{importResult.skipped}</span>
                <span className="text-[10px] font-bold text-slate-500">Bỏ qua trùng</span>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="p-3 bg-rose-50 rounded-xl text-left text-xs text-rose-700 max-h-32 overflow-y-auto">
                <p className="font-bold mb-1">Dòng có lỗi:</p>
                {importResult.errors.map((e, idx) => (
                  <p key={idx}>- Dòng {e.row}: {e.reason}</p>
                ))}
              </div>
            )}

            <Button onClick={onClose} variant="primary" size="md" className="w-full">
              ĐÓNG CỬA SỔ
            </Button>
          </div>
        ) : (
          /* File Upload & Preview Steps */
          <div className="space-y-5">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-300 hover:border-primary rounded-3xl p-6 text-center bg-slate-50/60 transition-colors">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
                id="excel-file-input"
              />
              <label htmlFor="excel-file-input" className="cursor-pointer block">
                <span className="text-3xl block mb-2">📁</span>
                <span className="text-xs font-bold text-primary block">
                  {file ? file.name : 'Bấm vào đây để chọn tệp Excel (.xlsx, .xls) hoặc CSV'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Tự động nhận diện các cột: Họ và tên, Giới tính, Ngày sinh, Tổ, Chức vụ, Năng khiếu
                </span>
              </label>
            </div>

            {/* Preview Section */}
            {parsedResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Phát hiện <strong>{parsedResult.validRows.length}</strong> dòng hợp lệ
                    {parsedResult.invalidRows.length > 0 && (
                      <span className="text-rose-600 ml-1">({parsedResult.invalidRows.length} dòng lỗi)</span>
                    )}
                  </span>

                  {/* Duplicate Strategy */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Xử lý trùng tên:</span>
                    <select
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value as 'skip' | 'update')}
                      className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="skip">Bỏ qua học sinh trùng</option>
                      <option value="update">Cập nhật đè dữ liệu mới</option>
                    </select>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="max-h-52 overflow-y-auto rounded-2xl border border-slate-200 custom-scrollbar text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold">
                      <tr>
                        <th className="p-2.5">STT</th>
                        <th className="p-2.5">Họ và tên</th>
                        <th className="p-2.5">Giới tính</th>
                        <th className="p-2.5">Ngày sinh</th>
                        <th className="p-2.5">Tổ</th>
                        <th className="p-2.5">Chức vụ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedResult.validRows.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-800">{row.fullName}</td>
                          <td className="p-2.5">{row.gender}</td>
                          <td className="p-2.5 text-slate-500">{row.birthDate || '-'}</td>
                          <td className="p-2.5">{row.groupName || '-'}</td>
                          <td className="p-2.5 text-slate-500">{row.classRole}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parsedResult.validRows.length > 10 && (
                  <p className="text-[11px] text-slate-400 text-center italic">
                    ... và {parsedResult.validRows.length - 10} học sinh khác
                  </p>
                )}

                {/* Submit Action */}
                <div className="flex gap-3 pt-2">
                  <Button type="button" onClick={onClose} variant="outline" size="md" className="flex-1">
                    HỦY
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmImport}
                    variant="primary"
                    size="md"
                    className="flex-1"
                    isLoading={isProcessing}
                  >
                    XÁC NHẬN NHẬP ({parsedResult.validRows.length} HỌC SINH)
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
