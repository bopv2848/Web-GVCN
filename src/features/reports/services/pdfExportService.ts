export interface PdfExportOptions {
  fileName?: string;
  reportElementId?: string;
  orientation?: 'portrait' | 'landscape';
  onProgress?: (progress: number, stage: string) => void;
}

/**
 * Dịch vụ xuất báo cáo A4 trực tiếp thành file PDF chất lượng cao
 * Tối ưu: Chỉ tải động thư viện jsPDF và html2canvas khi thực sự bấm xuất PDF (Code-Splitting)
 * Hỗ trợ tạo file PDF chuẩn A4 (cả khổ Dọc Portrait lẫn khổ Ngang Landscape),
 * xử lý phần tử in ấn ngoài màn hình (off-screen) và giữ nguyên độ sắc nét của văn bản, chữ ký, màu sắc.
 */
export const pdfExportService = {
  async exportToPdf(element: HTMLElement | null, options?: PdfExportOptions): Promise<boolean> {
    if (!element) {
      console.error('Không tìm thấy phần tử nội dung báo cáo để xuất PDF');
      return false;
    }

    const isLandscape = options?.orientation === 'landscape';
    const defaultName = isLandscape
      ? `So_Do_Lop_${new Date().toISOString().slice(0, 10)}.pdf`
      : `Bao_Cao_GVCN_${new Date().toISOString().slice(0, 10)}.pdf`;
    const fileName = options?.fileName || defaultName;
    let cloneContainer: HTMLDivElement | null = null;

    try {
      options?.onProgress?.(15, `Đang chuẩn bị trang in chuẩn A4 (${isLandscape ? 'Khổ ngang' : 'Khổ dọc'})...`);

      // Tải động (Dynamic Import) các thư viện nặng chỉ khi bắt đầu xuất PDF
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      // Tạo container tạm thời ngoài màn hình để render đầy đủ các thành phần (kể cả print-only)
      cloneContainer = document.createElement('div');
      cloneContainer.id = 'pdf-export-temp-container';
      cloneContainer.style.position = 'fixed';
      cloneContainer.style.top = '0';
      cloneContainer.style.left = '0';
      cloneContainer.style.width = isLandscape ? '1122px' : '794px'; // 297mm hoặc 210mm ở 96 DPI
      cloneContainer.style.height = isLandscape ? '794px' : 'auto';
      cloneContainer.style.backgroundColor = '#ffffff';
      cloneContainer.style.zIndex = '-99999';
      cloneContainer.style.pointerEvents = 'none';
      cloneContainer.style.overflow = 'hidden';

      // Sao chép nội dung báo cáo/sơ đồ vào container tạm
      const clonedElement = element.cloneNode(true) as HTMLElement;
      // Gỡ bỏ class ẩn (hidden) và áp dụng hiển thị phù hợp
      clonedElement.classList.remove('hidden');
      if (isLandscape) {
        clonedElement.style.display = 'flex';
        clonedElement.style.flexDirection = 'column';
        clonedElement.style.justifyContent = 'space-between';
        clonedElement.style.width = '1122px';
        clonedElement.style.minWidth = '1122px';
        clonedElement.style.maxWidth = '1122px';
        clonedElement.style.height = '794px';
        clonedElement.style.minHeight = '794px';
        clonedElement.style.maxHeight = '794px';
        clonedElement.style.boxSizing = 'border-box';
        // Căn lề trên thụt xuống thêm 0.5cm (~19px ở 96 DPI): trên 33px (~9mm), phải 20px, dưới 14px, trái 20px
        clonedElement.style.padding = '33px 20px 14px 20px';
        clonedElement.style.margin = '0';
        clonedElement.style.backgroundColor = '#ffffff';
      } else {
        clonedElement.style.display = 'block';
        clonedElement.style.width = '794px';
        clonedElement.style.minWidth = '794px';
        clonedElement.style.boxSizing = 'border-box';
      }
      clonedElement.style.visibility = 'visible';

      cloneContainer.appendChild(clonedElement);
      document.body.appendChild(cloneContainer);

      // Chờ các hình ảnh hoàn tất render
      options?.onProgress?.(35, 'Đang xử lý hình ảnh, logo và font chữ tiếng Việt...');
      const images = cloneContainer.querySelectorAll('img');
      const imagePromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      });
      await Promise.all(imagePromises);

      // Đảm bảo toàn bộ phông chữ hệ thống và tiếng Việt có dấu đã tải xong thước đo chính xác
      if (typeof document !== 'undefined' && 'fonts' in document) {
        await document.fonts.ready;
      }

      options?.onProgress?.(60, 'Đang kết xuất PDF độ phân giải cao...');
      const canvas = await html2canvas(cloneContainer, {
        scale: 2.5, // Nâng độ phân giải lên 2.5 để văn bản tiếng Việt và dấu thanh đạt độ sắc nét tuyệt đối
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: isLandscape ? 1122 : 794,
        height: isLandscape ? 794 : cloneContainer.scrollHeight,
        windowWidth: isLandscape ? 1122 : 794,
        windowHeight: isLandscape ? 794 : cloneContainer.scrollHeight,
        onclone: (clonedDoc) => {
          // Bảo vệ triệt để các dấu thanh và chân chữ tiếng Việt trong cây DOM ảo của html2canvas
          const nameBoxes = clonedDoc.querySelectorAll<HTMLElement>('[data-student-name-box]');
          nameBoxes.forEach((box) => {
            box.style.textRendering = 'geometricPrecision';
            box.style.overflow = 'visible';
          });
        },
      });

      options?.onProgress?.(85, 'Đang đóng gói file PDF A4...');
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = isLandscape ? 297 : 210; // Kích thước A4 (mm)
      const pageHeight = isLandscape ? 210 : 297; // Kích thước A4 (mm)

      if (isLandscape) {
        // Sử dụng định dạng PNG không mất mát dữ liệu (lossless) để giữ nguyên độ sắc nét của viền bàn và chân chữ tiếng Việt
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      } else {
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
