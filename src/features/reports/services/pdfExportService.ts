import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  fileName?: string;
  reportElementId?: string;
  onProgress?: (progress: number, stage: string) => void;
}

/**
 * Dịch vụ xuất báo cáo A4 trực tiếp thành file PDF chất lượng cao
 * Hỗ trợ tạo file PDF chuẩn A4, xử lý phần tử in ấn ngoài màn hình (off-screen)
 * và giữ nguyên độ sắc nét của văn bản, chữ ký cùng mã QR chống giả mạo.
 */
export const pdfExportService = {
  async exportToPdf(element: HTMLElement | null, options?: PdfExportOptions): Promise<boolean> {
    if (!element) {
      console.error('Không tìm thấy phần tử nội dung báo cáo để xuất PDF');
      return false;
    }

    const fileName = options?.fileName || `Bao_Cao_GVCN_${new Date().toISOString().slice(0, 10)}.pdf`;
    let cloneContainer: HTMLDivElement | null = null;

    try {
      options?.onProgress?.(15, 'Đang chuẩn bị trang in chuẩn A4...');

      // Tạo container tạm thời ngoài màn hình để render đầy đủ các thành phần (kể cả print-only)
      cloneContainer = document.createElement('div');
      cloneContainer.style.position = 'fixed';
      cloneContainer.style.left = '-99999px';
      cloneContainer.style.top = '0';
      cloneContainer.style.width = '794px'; // 210mm ở 96 DPI
      cloneContainer.style.backgroundColor = '#ffffff';
      cloneContainer.style.zIndex = '-9999';
      cloneContainer.style.opacity = '1';

      // Sao chép nội dung báo cáo vào container tạm
      const clonedElement = element.cloneNode(true) as HTMLElement;
      // Gỡ bỏ class ẩn (hidden) và áp dụng hiển thị khối
      clonedElement.classList.remove('hidden');
      clonedElement.style.display = 'block';
      clonedElement.style.visibility = 'visible';

      cloneContainer.appendChild(clonedElement);
      document.body.appendChild(cloneContainer);

      // Chờ các hình ảnh (chữ ký, mã QR, quốc huy) hoàn tất render
      options?.onProgress?.(35, 'Đang xử lý hình ảnh và chữ ký...');
      const images = cloneContainer.querySelectorAll('img');
      const imagePromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      });
      await Promise.all(imagePromises);

      options?.onProgress?.(60, 'Đang kết xuất PDF độ phân giải cao...');
      const canvas = await html2canvas(cloneContainer, {
        scale: 2, // Tăng gấp đôi độ phân giải để bản in và chữ ký sắc nét
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794,
      });

      options?.onProgress?.(85, 'Đang đóng gói file PDF A4...');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = 210; // Kích thước A4 (mm)
      const pageHeight = 297; // Kích thước A4 (mm)
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/jpeg', 0.96);

      let heightLeft = imgHeight;
      let position = 0;

      // Trang 1
      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Nếu báo cáo dài hơn 1 trang A4, tự động thêm trang tiếp theo
      while (heightLeft > 5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      options?.onProgress?.(100, 'Hoàn tất tải file!');
      pdf.save(fileName);
      return true;
    } catch (error) {
      console.error('Lỗi trong quá trình xuất PDF:', error);
      throw error;
    } finally {
      // Luôn dọn dẹp phần tử tạm thời khỏi DOM
      if (cloneContainer && cloneContainer.parentNode) {
        cloneContainer.parentNode.removeChild(cloneContainer);
      }
    }
  },
};
