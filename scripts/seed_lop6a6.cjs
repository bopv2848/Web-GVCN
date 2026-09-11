const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const url = 'https://huatporucovamymegjnw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YXRwb3J1Y292YW15bWVnam53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTA5MTY4OCwiZXhwIjoyMTA0NjY3Njg4fQ.9ZoG20OJTKaN_98BRlCm3VgO4jYD0MSS_J4CVF4_9-A';
const supabase = createClient(url, serviceRoleKey);

async function runSeed() {
    console.log('🚀 BẮT ĐẦU ĐỒNG BỘ DỮ LIỆU THỰC TẾ LỚP 6A6 LÊN SUPABASE CLOUD...');

    // 1. Trường học
    const schoolId = '6a600000-0000-0000-0000-000000000001';
    const { error: errSchool } = await supabase.from('schools').upsert({
        id: schoolId,
        name: 'TRƯỜNG THCS NGUYỄN VĂN TRỖI',
        code: 'THCS-NVT',
        address: 'Việt Nam'
    });
    if (errSchool) console.error('Lỗi tạo trường:', errSchool.message);
    else console.log('✅ Đã tạo Trường học');

    // 2. Niên khóa 2026 - 2027
    const yearId = '6a600000-0000-0000-0000-000000000002';
    const { error: errYear } = await supabase.from('academic_years').upsert({
        id: yearId,
        school_id: schoolId,
        name: '2026 - 2027',
        start_date: '2026-09-01',
        end_date: '2027-05-31',
        is_active: true
    });
    if (errYear) console.error('Lỗi tạo niên khóa:', errYear.message);
    else console.log('✅ Đã tạo Niên khóa 2026 - 2027');

    // 3. Lớp học 6A6
    const classId = '66666666-6666-6666-6666-666666666666';
    const { error: errClass } = await supabase.from('classes').upsert({
        id: classId,
        school_id: schoolId,
        academic_year_id: yearId,
        name: 'LỚP 6A6',
        grade_level: 6,
        theme_config: {
            month: 'CHỦ ĐIỂM THÁNG 9: TRUYỀN THỐNG NHÀ TRƯỜNG',
            title: 'CHUYẾN TÀU THANH XUÂN 6A6 • GVCN THẦY PHAN VĂN BỘ',
            bannerColorClass: 'from-[#1e1b4b] to-[#312e81]'
        },
        settings: {
            sidebarPosition: 'left',
            deductStarsOnRedeem: true
        }
    });
    if (errClass) console.error('Lỗi tạo lớp 6A6:', errClass.message);
    else console.log('✅ Đã tạo Lớp 6A6 (GVCN: Thầy Phan Văn Bộ)');

    // 4. 4 Tổ thi đua
    const groups = [
        { id: '6a600000-0000-0000-0001-000000000001', class_id: classId, name: 'Tổ 1', color_class: 'text-red-500', order_index: 1 },
        { id: '6a600000-0000-0000-0001-000000000002', class_id: classId, name: 'Tổ 2', color_class: 'text-green-500', order_index: 2 },
        { id: '6a600000-0000-0000-0001-000000000003', class_id: classId, name: 'Tổ 3', color_class: 'text-yellow-500', order_index: 3 },
        { id: '6a600000-0000-0000-0001-000000000004', class_id: classId, name: 'Tổ 4', color_class: 'text-blueAccent', order_index: 4 },
    ];
    const { error: errGroups } = await supabase.from('groups').upsert(groups);
    if (errGroups) console.error('Lỗi tạo tổ:', errGroups.message);
    else console.log('✅ Đã tạo 4 Tổ thi đua (Tổ 1, Tổ 2, Tổ 3, Tổ 4)');

    // 5. Đọc danh sách học sinh từ file Excel
    const wb = XLSX.readFile('d:/WEB-APP/DU-AN-GVCN/Web-GVCN/danh-sach-hs-6a6.xlsx');
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Mapping chức vụ cán sự theo file BAN-CAN-SU-LOP-6A6.md
    const roleMapping = {
        'Lê Ngọc Anh': 'Lớp trưởng',
        'Nguyễn Ngọc Ánh Tuyết': 'Lớp phó học tập',
        'Huỳnh Vũ Quỳnh Liên': 'Lớp phó lao động',
        'Huỳnh Huyền Nhiên': 'Tổ trưởng tổ 1',
        'Lạc Cao Quế Anh': 'Tổ trưởng tổ 2',
        'Phan Hiết My': 'Tổ trưởng tổ 3',
        'Trương Khả Hân': 'Tổ trưởng tổ 4',
        'Trương Thị Kim Hằng': 'Tổ phó tổ 1',
        'Huỳnh Na': 'Tổ phó tổ 2',
        'Nguyễn Thái Huy': 'Tổ phó tổ 3',
        'Cao Minh Ân': 'Tổ phó tổ 4'
    };

    const studentsToInsert = [];
    let studentIndex = 0;

    for (let i = 5; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (row && row[1]) {
            studentIndex++;
            const fullName = String(row[1]).trim();
            const dobRaw = row[2] ? String(row[2]).trim() : '';
            let birthDate = null;
            if (dobRaw && dobRaw.includes('/')) {
                const parts = dobRaw.split('/');
                if (parts.length === 3) {
                    birthDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }
            const gender = (row[3] && String(row[3]).trim().toLowerCase() === 'nữ') ? 'Nữ' : 'Nam';
            
            // Chia đều vào 4 tổ
            const groupIdx = (studentIndex - 1) % 4;
            const groupId = groups[groupIdx].id;
            
            // Gán chức vụ nếu có
            const classRole = roleMapping[fullName] || 'Thành viên';
            
            // ID xác định theo STT
            const sttHex = studentIndex.toString(16).padStart(4, '0');
            const studentId = `6a600000-0000-0000-0002-00000000${sttHex}`;
            const studentCode = `6A6${String(studentIndex).padStart(2, '0')}`;

            studentsToInsert.push({
                id: studentId,
                class_id: classId,
                group_id: groupId,
                full_name: fullName,
                gender: gender,
                birth_date: birthDate,
                class_role: classRole,
                code: studentCode,
                boarding_type: 'Bán trú'
            });
        }
    }

    const { error: errStudents } = await supabase.from('students').upsert(studentsToInsert);
    if (errStudents) console.error('Lỗi chèn học sinh:', errStudents.message);
    else console.log(`✅ Đã nạp thành công ${studentsToInsert.length} học sinh lớp 6A6 kèm phân công cán sự!`);

    // 6. Tiêu chí điểm thi đua chuẩn
    const criteria = [
        // Điểm cộng
        { class_id: classId, type: 'add', category_group: 'Nề nếp', title: 'Đi học đầy đủ cả tuần', default_points: 5, default_stars: 5 },
        { class_id: classId, type: 'add', category_group: 'Nề nếp', title: 'Buổi học tốt, trật tự', default_points: 5, default_stars: 5 },
        { class_id: classId, type: 'add', category_group: 'Học tập', title: 'Soạn bài và làm bài tập đầy đủ', default_points: 3, default_stars: 3 },
        { class_id: classId, type: 'add', category_group: 'Học tập', title: 'Phát biểu xây dựng bài tích cực', default_points: 3, default_stars: 3 },
        { class_id: classId, type: 'add', category_group: 'Học tập', title: 'Đạt điểm 8, 9, 10 kiểm tra', default_points: 10, default_stars: 10 },
        { class_id: classId, type: 'add', category_group: 'Phong trào', title: 'Tham gia phong trào, kế hoạch nhỏ', default_points: 5, default_stars: 5 },
        { class_id: classId, type: 'add', category_group: 'Đột xuất', title: 'Được nhà trường, thầy cô tuyên dương', default_points: 10, default_stars: 10 },
        { class_id: classId, type: 'add', category_group: 'Nề nếp', title: 'Tổ trực tuần sạch sẽ, hoàn thành tốt', default_points: 10, default_stars: 10 },
        
        // Điểm trừ
        { class_id: classId, type: 'subtract', category_group: 'Nề nếp', title: 'Vắng học không phép', default_points: -10, default_stars: 0 },
        { class_id: classId, type: 'subtract', category_group: 'Nề nếp', title: 'Đi học trễ', default_points: -5, default_stars: 0 },
        { class_id: classId, type: 'subtract', category_group: 'Nề nếp', title: 'Đồng phục không đúng quy định', default_points: -5, default_stars: 0 },
        { class_id: classId, type: 'subtract', category_group: 'Nề nếp', title: 'Nói chuyện, làm việc riêng trong giờ', default_points: -5, default_stars: 0 },
        { class_id: classId, type: 'subtract', category_group: 'Học tập', title: 'Không thuộc bài, không soạn bài', default_points: -10, default_stars: 0 },
        { class_id: classId, type: 'subtract', category_group: 'Học tập', title: 'Quên sách vở, dụng cụ học tập', default_points: -10, default_stars: 0 },
        { class_id: classId, type: 'subtract', category_group: 'Nề nếp', title: 'Không trực nhật vệ sinh lớp', default_points: -10, default_stars: 0 },
        { class_id: classId, type: 'subtract', category_group: 'Nề nếp', title: 'Mang đồ ăn, xả rác trong lớp', default_points: -10, default_stars: 0 }
    ];
    const { error: errCriteria } = await supabase.from('point_categories').upsert(criteria);
    if (errCriteria) console.error('Lỗi tạo tiêu chí:', errCriteria.message);
    else console.log(`✅ Đã nạp ${criteria.length} tiêu chí thi đua (Học tập, Nề nếp, Phong trào)!`);

    // 7. Shop quà tặng
    const rewards = [
        { class_id: classId, name: 'Đổi chỗ ngồi 1 ngày', star_cost: 10, stock_quantity: 50 },
        { class_id: classId, name: 'Bật bài hát yêu thích giờ ra chơi', star_cost: 20, stock_quantity: 50 },
        { class_id: classId, name: 'Miễn 1 bài tập về nhà', star_cost: 50, stock_quantity: 20 },
        { class_id: classId, name: 'Quà tặng bí mật từ Thầy Bộ', star_cost: 100, stock_quantity: 10 }
    ];
    const { error: errRewards } = await supabase.from('rewards').upsert(rewards);
    if (errRewards) console.error('Lỗi tạo quà tặng:', errRewards.message);
    else console.log(`✅ Đã nạp 4 phần thưởng đổi sao hấp dẫn!`);

    console.log('\n🎉 HOÀN TẤT ĐỒNG BỘ 100% DỮ LIỆU LỚP 6A6 LÊN SUPABASE CLOUD!');
}

runSeed().catch(console.error);
