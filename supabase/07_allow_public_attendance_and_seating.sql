-- ============================================================================
-- WEB-GVCN 2.0: CẤP QUYỀN RLS ĐỒNG BỘ ĐIỂM DANH & SƠ ĐỒ LỚP (TEST & MULTI-DEVICE)
-- Hướng dẫn: Thầy mở Supabase Dashboard -> Vào SQL Editor -> Bấm "New Query" -> Dán đoạn mã này và bấm RUN
-- ============================================================================

-- 1. BẢNG PHIÊN ĐIỂM DANH (attendance_sessions)
DROP POLICY IF EXISTS "Attendance sessions select test" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Attendance sessions mutate test" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Attendance sessions manage" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Attendance sessions read" ON public.attendance_sessions;

CREATE POLICY "Attendance sessions select test" 
ON public.attendance_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Attendance sessions mutate test" 
ON public.attendance_sessions 
FOR ALL 
USING (true) 
WITH CHECK (true);


-- 2. BẢNG CHI TIẾT ĐIỂM DANH TỪNG HỌC SINH (attendance_records)
DROP POLICY IF EXISTS "Attendance records select test" ON public.attendance_records;
DROP POLICY IF EXISTS "Attendance records mutate test" ON public.attendance_records;
DROP POLICY IF EXISTS "Attendance records manage" ON public.attendance_records;
DROP POLICY IF EXISTS "Attendance records read" ON public.attendance_records;

CREATE POLICY "Attendance records select test" 
ON public.attendance_records 
FOR SELECT 
USING (true);

CREATE POLICY "Attendance records mutate test" 
ON public.attendance_records 
FOR ALL 
USING (true) 
WITH CHECK (true);


-- 3. BẢNG KHUNG SƠ ĐỒ CHỖ NGỒI (seat_layouts)
DROP POLICY IF EXISTS "Seat layouts select test" ON public.seat_layouts;
DROP POLICY IF EXISTS "Seat layouts mutate test" ON public.seat_layouts;
DROP POLICY IF EXISTS "Seat layouts read" ON public.seat_layouts;
DROP POLICY IF EXISTS "Seat layouts manage GVCN" ON public.seat_layouts;

CREATE POLICY "Seat layouts select test" 
ON public.seat_layouts 
FOR SELECT 
USING (true);

CREATE POLICY "Seat layouts mutate test" 
ON public.seat_layouts 
FOR ALL 
USING (true) 
WITH CHECK (true);


-- 4. BẢNG PHÂN CÔNG CHỖ NGỒI HỌC SINH (seat_assignments)
DROP POLICY IF EXISTS "Seat assignments select test" ON public.seat_assignments;
DROP POLICY IF EXISTS "Seat assignments mutate test" ON public.seat_assignments;
DROP POLICY IF EXISTS "Seat assignments select" ON public.seat_assignments;
DROP POLICY IF EXISTS "Seat assignments manage" ON public.seat_assignments;

CREATE POLICY "Seat assignments select test" 
ON public.seat_assignments 
FOR SELECT 
USING (true);

CREATE POLICY "Seat assignments mutate test" 
ON public.seat_assignments 
FOR ALL 
USING (true) 
WITH CHECK (true);


-- 5. BẢNG CẤU HÌNH LỚP HỌC (class_configs)
DROP POLICY IF EXISTS "Class configs select test" ON public.class_configs;
DROP POLICY IF EXISTS "Class configs mutate test" ON public.class_configs;

CREATE POLICY "Class configs select test" 
ON public.class_configs 
FOR SELECT 
USING (true);

CREATE POLICY "Class configs mutate test" 
ON public.class_configs 
FOR ALL 
USING (true) 
WITH CHECK (true);


-- 6. MỞ QUYỀN GHI SỔ CÁI THI ĐUA (point_transactions)
DROP POLICY IF EXISTS "Point transactions mutate public" ON public.point_transactions;
CREATE POLICY "Point transactions mutate public" 
ON public.point_transactions 
FOR ALL 
USING (true) 
WITH CHECK (true);


-- 7. CẤU HÌNH CỘT created_by MẶC ĐỊNH CHO MÔI TRƯỜNG TEST (THẦY PHAN VĂN BỘ)
ALTER TABLE public.attendance_sessions ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.attendance_sessions ALTER COLUMN created_by SET DEFAULT '601dce7f-13e4-4680-b2f9-f86ed1a17079';

ALTER TABLE public.point_transactions ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.point_transactions ALTER COLUMN created_by SET DEFAULT '601dce7f-13e4-4680-b2f9-f86ed1a17079';

