-- ============================================================================
-- WEB-GVCN 2.0 MASTER SQL MIGRATION (COPY & DÁN VÀO SUPABASE SQL EDITOR)
-- Bao gồm: Schema 23 Bảng + 45 Chính sách RLS + 3 Storage Buckets
-- ============================================================================

-- 1. Tiện ích mở rộng cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Hàm tự động cập nhật trường updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. BẢNG TRƯỜNG HỌC & NIÊN KHÓA
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    address TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_schools_updated_at
BEFORE UPDATE ON public.schools
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_academic_dates CHECK (end_date > start_date)
);

-- 4. HỒ SƠ NGƯỜI DÙNG & VAI TRÒ TRƯỜNG
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    system_role TEXT NOT NULL DEFAULT 'teacher' CHECK (system_role IN ('admin', 'teacher', 'student', 'parent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.school_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('principal', 'vice_principal', 'teacher', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_school_profile UNIQUE (school_id, profile_id)
);

-- 5. LỚP HỌC & THÀNH VIÊN LỚP
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade_level INT NOT NULL CHECK (grade_level BETWEEN 1 AND 12),
    banner_url TEXT,
    theme_config JSONB NOT NULL DEFAULT '{"month": "CHỦ ĐIỂM THÁNG 9", "title": "CHUYẾN TÀU THANH XUÂN", "bannerColorClass": "from-[#1e1b4b] to-[#312e81]"}'::jsonb,
    settings JSONB NOT NULL DEFAULT '{"sidebarPosition": "left", "deductStarsOnRedeem": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE OR REPLACE TRIGGER set_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.class_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('gvcn', 'bancansu', 'bgh_viewer', 'student', 'parent')),
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_class_profile_role UNIQUE (class_id, profile_id, role)
);

-- 6. TỔ THI ĐUA & HỌC SINH
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color_class TEXT NOT NULL DEFAULT 'text-red-500',
    avatar_url TEXT,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_class_group_name UNIQUE (class_id, name)
);

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Nam', 'Nữ')),
    birth_date DATE,
    class_role TEXT NOT NULL DEFAULT 'Thành viên',
    avatar_url TEXT,
    goals TEXT,
    talents TEXT,
    boarding_type TEXT DEFAULT 'Bán trú',
    code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE OR REPLACE TRIGGER set_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.student_guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    guardian_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL DEFAULT 'Phụ huynh' CHECK (relationship IN ('Bố', 'Mẹ', 'Người giám hộ', 'Phụ huynh')),
    invite_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    token_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TIÊU CHÍ & SỔ CÁI ĐIỂM THI ĐUA (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS public.point_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('add', 'subtract')),
    category_group TEXT NOT NULL CHECK (category_group IN ('Học tập', 'Nề nếp', 'Phong trào', 'Đột xuất')),
    title TEXT NOT NULL,
    default_points INT NOT NULL DEFAULT 1,
    default_stars INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.point_categories(id) ON DELETE SET NULL,
    points INT NOT NULL,
    stars INT NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    note TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    reversal_of_id UUID REFERENCES public.point_transactions(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ĐIỂM DANH CHUYÊN CẦN
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'morning' CHECK (session_type IN ('morning', 'afternoon', 'full_day')),
    is_locked BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_class_session_date UNIQUE (class_id, session_date, session_type)
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('present', 'late', 'excused_absence', 'unexcused_absence')),
    note TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);

CREATE OR REPLACE TRIGGER set_attendance_records_updated_at
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. SHOP QUÀ TẶNG & ĐỔI SAO
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    star_cost INT NOT NULL CHECK (star_cost >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_rewards_updated_at
BEFORE UPDATE ON public.rewards
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
    stars_spent INT NOT NULL CHECK (stars_spent >= 0),
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_reward_redemptions_updated_at
BEFORE UPDATE ON public.reward_redemptions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. SƠ ĐỒ CHỖ NGỒI, THỜI KHÓA BIỂU, NHIỆM VỤ & CỘT MỐC
CREATE TABLE IF NOT EXISTS public.seat_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    layout_name TEXT NOT NULL DEFAULT 'Sơ đồ chính',
    rows INT NOT NULL DEFAULT 5 CHECK (rows BETWEEN 1 AND 10),
    cols INT NOT NULL DEFAULT 8 CHECK (cols BETWEEN 1 AND 12),
    is_current BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.seat_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layout_id UUID NOT NULL REFERENCES public.seat_layouts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    row_index INT NOT NULL,
    col_index INT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_layout_position UNIQUE (layout_id, row_index, col_index),
    CONSTRAINT uq_layout_student UNIQUE (layout_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.timetable_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 2 AND 8),
    period INT NOT NULL CHECK (period BETWEEN 1 AND 10),
    subject_name TEXT NOT NULL,
    lesson_topic TEXT,
    teacher_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_class_timetable_slot UNIQUE (class_id, day_of_week, period)
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.class_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. BẢNG TRẠM ĐỒNG HÀNH (BẢO MẬT CAO)
CREATE TABLE IF NOT EXISTS public.companion_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'completed')),
    severity_level TEXT NOT NULL DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'critical')),
    primary_concern TEXT NOT NULL,
    action_plan TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE OR REPLACE TRIGGER set_companion_cases_updated_at
BEFORE UPDATE ON public.companion_cases
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.companion_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.companion_cases(id) ON DELETE CASCADE,
    update_date DATE NOT NULL DEFAULT CURRENT_DATE,
    observation_notes TEXT NOT NULL,
    interaction_summary TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. BẢNG NHẬT KÝ KIỂM TOÁN
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_resource TEXT NOT NULL,
    target_id UUID,
    ip_address TEXT,
    user_agent TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. INDEXES TỐI ƯU
CREATE INDEX IF NOT EXISTS idx_classes_school ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_point_tx_student ON public.point_transactions(student_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_companion_cases_class ON public.companion_cases(class_id) WHERE deleted_at IS NULL;

-- 14. HÀM BẢO MẬT RLS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_class_member(target_class_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.class_memberships
        WHERE class_id = target_class_id AND profile_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_class_gvcn(target_class_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.class_memberships
        WHERE class_id = target_class_id AND profile_id = auth.uid() AND role = 'gvcn'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_class_bancansu(target_class_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.class_memberships
        WHERE class_id = target_class_id AND profile_id = auth.uid() AND role = 'bancansu'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_school_bgh(target_class_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.classes c
        JOIN public.school_memberships sm ON sm.school_id = c.school_id
        WHERE c.id = target_class_id AND sm.profile_id = auth.uid() AND sm.role IN ('principal', 'vice_principal')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_student_guardian(target_student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.student_guardians
        WHERE student_id = target_student_id AND guardian_profile_id = auth.uid() AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. BẬT ROW LEVEL SECURITY
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

-- 16. CHÍNH SÁCH RLS POLICIES
CREATE POLICY "Profiles read" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Classes read" ON public.classes FOR SELECT TO authenticated USING (public.is_class_member(id) OR public.is_school_bgh(id));
CREATE POLICY "Classes update GVCN" ON public.classes FOR UPDATE TO authenticated USING (public.is_class_gvcn(id));

CREATE POLICY "Students read" ON public.students FOR SELECT TO authenticated USING (public.is_class_member(class_id) OR public.is_school_bgh(class_id) OR public.is_student_guardian(id));
CREATE POLICY "Students manage GVCN" ON public.students FOR ALL TO authenticated USING (public.is_class_gvcn(class_id));

CREATE POLICY "Groups read" ON public.groups FOR SELECT TO authenticated USING (public.is_class_member(class_id) OR public.is_school_bgh(class_id));
CREATE POLICY "Groups manage GVCN" ON public.groups FOR ALL TO authenticated USING (public.is_class_gvcn(class_id));

CREATE POLICY "Point tx read" ON public.point_transactions FOR SELECT TO authenticated USING (public.is_class_member(class_id) OR public.is_school_bgh(class_id) OR public.is_student_guardian(student_id));
CREATE POLICY "Point tx insert" ON public.point_transactions FOR INSERT TO authenticated WITH CHECK (public.is_class_gvcn(class_id) OR (public.is_class_bancansu(class_id) AND created_by = auth.uid()));
CREATE POLICY "Point tx no update" ON public.point_transactions FOR UPDATE TO authenticated USING (false);
CREATE POLICY "Point tx no delete" ON public.point_transactions FOR DELETE TO authenticated USING (false);

CREATE POLICY "Attendance sessions read" ON public.attendance_sessions FOR SELECT TO authenticated USING (public.is_class_member(class_id) OR public.is_school_bgh(class_id));
CREATE POLICY "Attendance sessions manage" ON public.attendance_sessions FOR ALL TO authenticated USING (public.is_class_gvcn(class_id) OR public.is_class_bancansu(class_id));

CREATE POLICY "Attendance records read" ON public.attendance_records FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.attendance_sessions ses WHERE ses.id = session_id AND (public.is_class_member(ses.class_id) OR public.is_school_bgh(ses.class_id))) OR public.is_student_guardian(student_id));
CREATE POLICY "Attendance records manage" ON public.attendance_records FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.attendance_sessions ses WHERE ses.id = session_id AND (public.is_class_gvcn(ses.class_id) OR public.is_class_bancansu(ses.class_id))));

CREATE POLICY "Rewards read" ON public.rewards FOR SELECT TO authenticated USING (public.is_class_member(class_id) OR public.is_school_bgh(class_id));
CREATE POLICY "Rewards manage GVCN" ON public.rewards FOR ALL TO authenticated USING (public.is_class_gvcn(class_id));

CREATE POLICY "Companion cases SELECT ONLY GVCN" ON public.companion_cases FOR SELECT TO authenticated USING (public.is_class_gvcn(class_id));
CREATE POLICY "Companion cases ALL ONLY GVCN" ON public.companion_cases FOR ALL TO authenticated USING (public.is_class_gvcn(class_id));
CREATE POLICY "Companion updates SELECT ONLY GVCN" ON public.companion_updates FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.companion_cases c WHERE c.id = case_id AND public.is_class_gvcn(c.class_id)));
CREATE POLICY "Companion updates ALL ONLY GVCN" ON public.companion_updates FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.companion_cases c WHERE c.id = case_id AND public.is_class_gvcn(c.class_id)));
