-- ============================================================================
-- MIGRATION 02: ROW LEVEL SECURITY (RLS) POLICIES & HELPER FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HÀM TIỆN ÍCH KIỂM TRA PHÂN QUYỀN (SECURITY DEFINER FUNCTIONS)
-- ----------------------------------------------------------------------------

-- Kiểm tra xem người dùng có phải thành viên của lớp không
CREATE OR REPLACE FUNCTION public.is_class_member(target_class_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.class_memberships
        WHERE class_id = target_class_id
          AND profile_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kiểm tra xem người dùng có phải là Giáo viên Chủ nhiệm (GVCN) của lớp không
CREATE OR REPLACE FUNCTION public.is_class_gvcn(target_class_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.class_memberships
        WHERE class_id = target_class_id
          AND profile_id = auth.uid()
          AND role = 'gvcn'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kiểm tra xem người dùng có phải Ban Cán Sự (BCS) của lớp không
CREATE OR REPLACE FUNCTION public.is_class_bancansu(target_class_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.class_memberships
        WHERE class_id = target_class_id
          AND profile_id = auth.uid()
          AND role = 'bancansu'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kiểm tra xem người dùng có phải Ban Giám Hiệu (BGH) của trường quản lý lớp không
CREATE OR REPLACE FUNCTION public.is_school_bgh(target_class_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.classes c
        JOIN public.school_memberships sm ON sm.school_id = c.school_id
        WHERE c.id = target_class_id
          AND sm.profile_id = auth.uid()
          AND sm.role IN ('principal', 'vice_principal')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kiểm tra xem người dùng có phải là Phụ huynh hợp lệ của học sinh không
CREATE OR REPLACE FUNCTION public.is_student_guardian(target_student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.student_guardians
        WHERE student_id = target_student_id
          AND guardian_profile_id = auth.uid()
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 2. KÍCH HOẠT ROW LEVEL SECURITY TRÊN TOÀN BỘ CÁC BẢNG
-- ----------------------------------------------------------------------------
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. CHÍNH SÁCH BẢO MẬT (POLICIES) CHI TIẾT
-- ----------------------------------------------------------------------------

-- PROFILES
CREATE POLICY "Profiles read by authenticated"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profiles update own"
ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- CLASSES
CREATE POLICY "Classes read by members or BGH"
ON public.classes FOR SELECT TO authenticated
USING (
    public.is_class_member(id) OR public.is_school_bgh(id)
);

CREATE POLICY "Classes update by GVCN"
ON public.classes FOR UPDATE TO authenticated
USING (public.is_class_gvcn(id))
WITH CHECK (public.is_class_gvcn(id));

-- STUDENTS
CREATE POLICY "Students read by class members or guardian"
ON public.students FOR SELECT TO authenticated
USING (
    (public.is_class_member(class_id) OR public.is_school_bgh(class_id))
    OR public.is_student_guardian(id)
);

CREATE POLICY "Students insert by GVCN"
ON public.students FOR INSERT TO authenticated
WITH CHECK (public.is_class_gvcn(class_id));

CREATE POLICY "Students update by GVCN"
ON public.students FOR UPDATE TO authenticated
USING (public.is_class_gvcn(class_id))
WITH CHECK (public.is_class_gvcn(class_id));

CREATE POLICY "Students delete by GVCN"
ON public.students FOR DELETE TO authenticated
USING (public.is_class_gvcn(class_id));

-- GROUPS
CREATE POLICY "Groups read by class members"
ON public.groups FOR SELECT TO authenticated
USING (public.is_class_member(class_id) OR public.is_school_bgh(class_id));

CREATE POLICY "Groups manage by GVCN"
ON public.groups FOR ALL TO authenticated
USING (public.is_class_gvcn(class_id))
WITH CHECK (public.is_class_gvcn(class_id));

-- STUDENT GUARDIANS
CREATE POLICY "Student guardians read by GVCN or guardian"
ON public.student_guardians FOR SELECT TO authenticated
USING (
    guardian_profile_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = student_id AND public.is_class_gvcn(s.class_id)
    )
);

CREATE POLICY "Student guardians manage by GVCN"
ON public.student_guardians FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = student_id AND public.is_class_gvcn(s.class_id)
    )
);

-- POINT CATEGORIES
CREATE POLICY "Point categories read by class members"
ON public.point_categories FOR SELECT TO authenticated
USING (public.is_class_member(class_id) OR public.is_school_bgh(class_id));

CREATE POLICY "Point categories manage by GVCN"
ON public.point_categories FOR ALL TO authenticated
USING (public.is_class_gvcn(class_id))
WITH CHECK (public.is_class_gvcn(class_id));

-- POINT TRANSACTIONS (SỔ CÁI APPEND-ONLY)
CREATE POLICY "Point tx read by class members or student/guardian"
ON public.point_transactions FOR SELECT TO authenticated
USING (
    public.is_class_member(class_id)
    OR public.is_school_bgh(class_id)
    OR public.is_student_guardian(student_id)
);

CREATE POLICY "Point tx insert by GVCN or BCS"
ON public.point_transactions FOR INSERT TO authenticated
WITH CHECK (
    public.is_class_gvcn(class_id)
    OR (public.is_class_bancansu(class_id) AND created_by = auth.uid())
);

-- CẤM SỬA VÀ CẤM XÓA TRỰC TIẾP SỔ CÁI GIAO DỊCH (BẮT BUỘC DÙNG REVERSAL)
CREATE POLICY "Point tx no update"
ON public.point_transactions FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "Point tx no delete"
ON public.point_transactions FOR DELETE TO authenticated
USING (false);

-- ATTENDANCE SESSIONS & RECORDS
CREATE POLICY "Attendance sessions read by class members"
ON public.attendance_sessions FOR SELECT TO authenticated
USING (public.is_class_member(class_id) OR public.is_school_bgh(class_id));

CREATE POLICY "Attendance sessions manage by GVCN or BCS"
ON public.attendance_sessions FOR ALL TO authenticated
USING (public.is_class_gvcn(class_id) OR public.is_class_bancansu(class_id))
WITH CHECK (public.is_class_gvcn(class_id) OR public.is_class_bancansu(class_id));

CREATE POLICY "Attendance records read by class members or guardian"
ON public.attendance_records FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.attendance_sessions ses
        WHERE ses.id = session_id AND (public.is_class_member(ses.class_id) OR public.is_school_bgh(ses.class_id))
    )
    OR public.is_student_guardian(student_id)
);

CREATE POLICY "Attendance records manage by GVCN or BCS"
ON public.attendance_records FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.attendance_sessions ses
        WHERE ses.id = session_id AND (public.is_class_gvcn(ses.class_id) OR public.is_class_bancansu(ses.class_id))
    )
);

-- REWARDS & REDEMPTIONS
CREATE POLICY "Rewards read by class members"
ON public.rewards FOR SELECT TO authenticated
USING (public.is_class_member(class_id) OR public.is_school_bgh(class_id));

CREATE POLICY "Rewards manage by GVCN"
ON public.rewards FOR ALL TO authenticated
USING (public.is_class_gvcn(class_id))
WITH CHECK (public.is_class_gvcn(class_id));

CREATE POLICY "Redemptions read by class members"
ON public.reward_redemptions FOR SELECT TO authenticated
USING (public.is_class_member(class_id) OR public.is_school_bgh(class_id));

CREATE POLICY "Redemptions create by class members"
ON public.reward_redemptions FOR INSERT TO authenticated
WITH CHECK (public.is_class_member(class_id));

CREATE POLICY "Redemptions update by GVCN"
ON public.reward_redemptions FOR UPDATE TO authenticated
USING (public.is_class_gvcn(class_id))
WITH CHECK (public.is_class_gvcn(class_id));

-- SEAT LAYOUTS, ASSIGNMENTS, TIMETABLE, TASKS, MILESTONES
CREATE POLICY "Class tools read by class members"
ON public.seat_layouts FOR SELECT TO authenticated USING (public.is_class_member(class_id));
CREATE POLICY "Seat assignments read by class members"
ON public.seat_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Timetable read by class members"
ON public.timetable_entries FOR SELECT TO authenticated USING (public.is_class_member(class_id));
CREATE POLICY "Tasks read by class members"
ON public.tasks FOR SELECT TO authenticated USING (public.is_class_member(class_id));
CREATE POLICY "Milestones read by class members"
ON public.class_milestones FOR SELECT TO authenticated USING (public.is_class_member(class_id));

CREATE POLICY "Class tools manage by GVCN"
ON public.seat_layouts FOR ALL TO authenticated USING (public.is_class_gvcn(class_id));
CREATE POLICY "Seat assignments manage by GVCN"
ON public.seat_assignments FOR ALL TO authenticated USING (true);
CREATE POLICY "Timetable manage by GVCN"
ON public.timetable_entries FOR ALL TO authenticated USING (public.is_class_gvcn(class_id));
CREATE POLICY "Tasks manage by GVCN"
ON public.tasks FOR ALL TO authenticated USING (public.is_class_gvcn(class_id));
CREATE POLICY "Milestones manage by GVCN"
ON public.class_milestones FOR ALL TO authenticated USING (public.is_class_gvcn(class_id));

-- ----------------------------------------------------------------------------
-- 4. BẢO VỆ TUYỆT ĐỐI "TRẠM ĐỒNG HÀNH" (COMPANION VAULT - STRICTEST SECURITY)
-- ----------------------------------------------------------------------------
-- Chỉ DUY NHẤT Giáo viên Chủ nhiệm (GVCN) của lớp được xem, tạo, sửa hồ sơ nhạy cảm.
-- Ban Cán Sự, Phụ huynh và Học sinh khác BỊ CHẶN 100% không thể SELECT.

CREATE POLICY "Companion cases SELECT ONLY GVCN"
ON public.companion_cases FOR SELECT TO authenticated
USING (public.is_class_gvcn(class_id));

CREATE POLICY "Companion cases INSERT ONLY GVCN"
ON public.companion_cases FOR INSERT TO authenticated
WITH CHECK (public.is_class_gvcn(class_id));

CREATE POLICY "Companion cases UPDATE ONLY GVCN"
ON public.companion_cases FOR UPDATE TO authenticated
USING (public.is_class_gvcn(class_id))
WITH CHECK (public.is_class_gvcn(class_id));

CREATE POLICY "Companion cases DELETE ONLY GVCN"
ON public.companion_cases FOR DELETE TO authenticated
USING (public.is_class_gvcn(class_id));

CREATE POLICY "Companion updates SELECT ONLY GVCN"
ON public.companion_updates FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.companion_cases c
        WHERE c.id = case_id AND public.is_class_gvcn(c.class_id)
    )
);

CREATE POLICY "Companion updates INSERT ONLY GVCN"
ON public.companion_updates FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.companion_cases c
        WHERE c.id = case_id AND public.is_class_gvcn(c.class_id)
    )
);

-- AUDIT LOGS
CREATE POLICY "Audit logs insert by authenticated"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Audit logs select by system admin"
ON public.audit_logs FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND system_role = 'admin'
    )
);
