const { createClient } = require('@supabase/supabase-js');

const url = 'https://huatporucovamymegjnw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YXRwb3J1Y292YW15bWVnam53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTA5MTY4OCwiZXhwIjoyMTA0NjY3Njg4fQ.9ZoG20OJTKaN_98BRlCm3VgO4jYD0MSS_J4CVF4_9-A';
const admin = createClient(url, serviceRoleKey);

const classId = '66666666-6666-6666-6666-666666666666';

async function createAccounts() {
    console.log('🚀 ĐANG KHỞI TẠO TÀI KHOẢN GVCN & BAN CÁN SỰ TRÊN SUPABASE AUTH...');

    // 1. Tài khoản GVCN Thầy Phan Văn Bộ
    const gvcnEmail = 'gvcn.lop6a6@gmail.com';
    const gvcnPass = 'Gvcn6A6@2026';
    
    let gvcnUser;
    const { data: listData } = await admin.auth.admin.listUsers();
    const existingGV = listData?.users?.find(u => u.email === gvcnEmail);

    if (existingGV) {
        gvcnUser = existingGV;
        console.log('✅ Tài khoản GVCN đã tồn tại:', gvcnEmail);
    } else {
        const { data: newUser, error: errNew } = await admin.auth.admin.createUser({
            email: gvcnEmail,
            password: gvcnPass,
            email_confirm: true,
            user_metadata: { full_name: 'Thầy Phan Văn Bộ', role: 'gvcn' }
        });
        if (errNew) {
            console.error('Lỗi tạo user GVCN:', errNew.message);
            return;
        }
        gvcnUser = newUser.user;
        console.log('✅ Đã tạo tài khoản GVCN mới:', gvcnEmail);
    }

    // Upsert Profile GVCN
    await admin.from('profiles').upsert({
        id: gvcnUser.id,
        full_name: 'Thầy Phan Văn Bộ',
        email: gvcnEmail,
        system_role: 'teacher'
    });

    // Upsert Class Membership GVCN
    await admin.from('class_memberships').upsert({
        class_id: classId,
        profile_id: gvcnUser.id,
        role: 'gvcn',
        permissions: { all: true }
    });
    console.log('✅ Đã gán quyền GVCN Lớp 6A6 cho Thầy Phan Văn Bộ');

    // 2. Tài khoản Ban Cán Sự (Lớp trưởng Lê Ngọc Anh)
    const bcsEmail = 'bcs.lop6a6@gmail.com';
    const bcsPass = 'Bcs6A6@2026';

    let bcsUser;
    const existingBCS = listData?.users?.find(u => u.email === bcsEmail);

    if (existingBCS) {
        bcsUser = existingBCS;
        console.log('✅ Tài khoản BCS đã tồn tại:', bcsEmail);
    } else {
        const { data: newBcs, error: errBcs } = await admin.auth.admin.createUser({
            email: bcsEmail,
            password: bcsPass,
            email_confirm: true,
            user_metadata: { full_name: 'Lê Ngọc Anh (Lớp trưởng)', role: 'bancansu' }
        });
        if (errBcs) {
            console.error('Lỗi tạo user BCS:', errBcs.message);
        } else {
            bcsUser = newBcs.user;
            console.log('✅ Đã tạo tài khoản BCS mới:', bcsEmail);
        }
    }

    if (bcsUser) {
        await admin.from('profiles').upsert({
            id: bcsUser.id,
            full_name: 'Lê Ngọc Anh (Lớp trưởng)',
            email: bcsEmail,
            system_role: 'student'
        });

        await admin.from('class_memberships').upsert({
            class_id: classId,
            profile_id: bcsUser.id,
            role: 'bancansu',
            permissions: { attendance: true, points: true }
        });
        console.log('✅ Đã gán quyền Ban Cán Sự Lớp 6A6 cho Lớp trưởng Lê Ngọc Anh');
    }

    console.log('\n🎉 THÔNG TIN ĐĂNG NHẬP THỬ NGHIỆM:');
    console.log('1. GIÁO VIÊN CHỦ NHIỆM:');
    console.log(`   - Email:    ${gvcnEmail}`);
    console.log(`   - Mật khẩu: ${gvcnPass}`);
    console.log('2. BAN CÁN SỰ LỚP:');
    console.log(`   - Email:    ${bcsEmail}`);
    console.log(`   - Mật khẩu: ${bcsPass}`);
}

createAccounts().catch(console.error);
