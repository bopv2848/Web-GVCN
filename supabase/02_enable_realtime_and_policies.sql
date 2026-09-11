-- ============================================================================
-- WEB-GVCN 2.0: KÍCH HOẠT REALTIME WEBSOCKETS CHO ĐIỂM DANH VÀ THI ĐUA
-- Thầy mở Supabase -> SQL Editor -> Tạo New Query -> Dán đoạn mã này và bấm RUN
-- ============================================================================

-- 1. Kích hoạt phát sóng Realtime WebSockets cho 3 bảng trọng yếu
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.point_transactions;

-- 2. Đảm bảo cấu hình Replica Identity Full để Supabase Realtime gửi toàn bộ dữ liệu thay đổi
ALTER TABLE public.attendance_records REPLICA IDENTITY FULL;
ALTER TABLE public.attendance_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.point_transactions REPLICA IDENTITY FULL;

-- 3. Cập nhật chính sách RLS cho phép Ban cán sự lớp (bancansu) điểm danh và chấm điểm
DROP POLICY IF EXISTS Attendance records manage ON public.attendance_records;
CREATE POLICY Attendance records manage ON public.attendance_records
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.attendance_sessions ses 
        WHERE ses.id = session_id AND (public.is_class_gvcn(ses.class_id) OR public.is_class_bancansu(ses.class_id))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.attendance_sessions ses 
        WHERE ses.id = session_id AND (public.is_class_gvcn(ses.class_id) OR public.is_class_bancansu(ses.class_id))
    )
);

DROP POLICY IF EXISTS Attendance sessions manage ON public.attendance_sessions;
CREATE POLICY Attendance sessions manage ON public.attendance_sessions
FOR ALL TO authenticated
USING (public.is_class_gvcn(class_id) OR public.is_class_bancansu(class_id))
WITH CHECK (public.is_class_gvcn(class_id) OR public.is_class_bancansu(class_id));

DROP POLICY IF EXISTS Point tx insert ON public.point_transactions;
CREATE POLICY Point tx insert ON public.point_transactions
FOR INSERT TO authenticated
WITH CHECK (public.is_class_gvcn(class_id) OR public.is_class_bancansu(class_id));
