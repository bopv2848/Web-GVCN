import { describe, it, expect } from 'vitest';
import { seatingService } from './seatingService';
import { sandboxService } from '../../sandbox/services/sandboxService';
import type { SeatAssignmentWithStudent } from '../../../types/seating';
import type { Student } from '../../../types/student';

describe('seatingService - analyzeInfectionClusters', () => {
  const sampleAssignments: SeatAssignmentWithStudent[] = [
    // Bàn 1 - Dãy 1 (Tổ 4) - Cột 0 và Cột 1
    {
      id: 'a1',
      layoutId: 'lay-1',
      studentId: 'hs-1',
      rowIndex: 0,
      colIndex: 0,
      isHidden: false,
      student: { id: 'hs-1', fullName: 'Nguyễn Văn An', groupName: 'Tổ 4' } as unknown as Student,
    },
    {
      id: 'a2',
      layoutId: 'lay-1',
      studentId: 'hs-2',
      rowIndex: 0,
      colIndex: 1,
      isHidden: false,
      student: { id: 'hs-2', fullName: 'Trần Thị Bích', groupName: 'Tổ 4' } as unknown as Student,
    },
    // Bàn 2 - Dãy 1 (Tổ 4) - Ngay sau Bàn 1
    {
      id: 'a3',
      layoutId: 'lay-1',
      studentId: 'hs-3',
      rowIndex: 1,
      colIndex: 0,
      isHidden: false,
      student: { id: 'hs-3', fullName: 'Lê Hoàng Cường', groupName: 'Tổ 4' } as unknown as Student,
    },
    {
      id: 'a4',
      layoutId: 'lay-1',
      studentId: 'hs-4',
      rowIndex: 1,
      colIndex: 1,
      isHidden: false,
      student: { id: 'hs-4', fullName: 'Phạm Thu Dung', groupName: 'Tổ 4' } as unknown as Student,
    },
    // Bàn 1 - Dãy 2 (Tổ 3) - Cột 2 và Cột 3
    {
      id: 'a5',
      layoutId: 'lay-1',
      studentId: 'hs-5',
      rowIndex: 0,
      colIndex: 2,
      isHidden: false,
      student: { id: 'hs-5', fullName: 'Đỗ Văn Em', groupName: 'Tổ 3' } as unknown as Student,
    },
  ];

  it('phát hiện cụm lây nhiễm nguy cơ cao khi 2 học sinh ngồi cùng bàn đều bị ốm', () => {
    // hs-1 và hs-2 cùng ngồi Bàn 1 Tổ 4 và cùng ốm
    const sickIds = new Set(['hs-1', 'hs-2']);
    const result = seatingService.analyzeInfectionClusters(sampleAssignments, sickIds);

    expect(result.clusters.length).toBe(1);
    expect(result.clusters[0].riskLevel).toBe('high');
    expect(result.clusters[0].sickStudentIds).toContain('hs-1');
    expect(result.clusters[0].sickStudentIds).toContain('hs-2');

    // Các bạn ngồi ngay sau (hs-3, hs-4) phải được đánh dấu nguy cơ lây nhiễm
    expect(result.atRiskNeighborStudentIds.has('hs-3')).toBe(true);
    expect(result.atRiskNeighborStudentIds.has('hs-4')).toBe(true);
  });

  it('đánh dấu bạn cùng bàn là đối tượng nguy cơ khi chỉ có 1 em bị ốm', () => {
    // Chỉ có hs-1 ốm, hs-2 ngồi cùng bàn chưa ốm
    const sickIds = new Set(['hs-1']);
    const result = seatingService.analyzeInfectionClusters(sampleAssignments, sickIds);

    expect(result.clusters.length).toBe(0); // Chưa tạo thành cụm vì chỉ 1 em ốm
    expect(result.atRiskNeighborStudentIds.has('hs-2')).toBe(true); // Bạn cùng bàn phải được cảnh báo
  });

  it('trả về rỗng khi không có học sinh nào bị ốm', () => {
    const sickIds = new Set<string>();
    const result = seatingService.analyzeInfectionClusters(sampleAssignments, sickIds);

    expect(result.clusters.length).toBe(0);
    expect(result.atRiskNeighborStudentIds.size).toBe(0);
    expect(result.totalSickInSeats).toBe(0);
  });
});

describe('seatingService - rotateWeekLayout', () => {
  it('đổi đúng các cột theo quy ước hoán đổi đối xứng của SO-DO-LOP.xlsx', () => {
    // Cột 0, 1 (Dãy 1 - Tổ 4) <-> Cột 2, 3 (Dãy 2 - Tổ 3)
    expect(seatingService.rotateColIndex(0)).toBe(2);
    expect(seatingService.rotateColIndex(1)).toBe(3);
    expect(seatingService.rotateColIndex(2)).toBe(0);
    expect(seatingService.rotateColIndex(3)).toBe(1);

    // Cột 4, 5 (Dãy 3 - Tổ 2) <-> Cột 6, 7 (Dãy 4 - Tổ 1)
    expect(seatingService.rotateColIndex(4)).toBe(6);
    expect(seatingService.rotateColIndex(5)).toBe(7);
    expect(seatingService.rotateColIndex(6)).toBe(4);
    expect(seatingService.rotateColIndex(7)).toBe(5);

    // Tính chất đối xứng hai chiều (Involutive): Đảo 2 lần quay về vị trí ban đầu
    for (let c = 0; c < 8; c++) {
      expect(seatingService.rotateColIndex(seatingService.rotateColIndex(c))).toBe(c);
    }
  });

  it('xoay toàn bộ danh sách phân công chỗ ngồi giữa tuần lẻ và tuần chẵn chính xác', () => {
    const originalAssignments: SeatAssignmentWithStudent[] = [
      {
        id: '1',
        layoutId: 'l1',
        studentId: 's1',
        rowIndex: 0,
        colIndex: 0,
        isHidden: false,
      },
      {
        id: '2',
        layoutId: 'l1',
        studentId: 's2',
        rowIndex: 0,
        colIndex: 1,
        isHidden: false,
      },
      {
        id: '3',
        layoutId: 'l1',
        studentId: 's3',
        rowIndex: 1,
        colIndex: 5,
        isHidden: false,
      },
    ];

    const rotated = seatingService.rotateAssignments(originalAssignments);

    expect(rotated[0].colIndex).toBe(2); // Cột 0 -> Cột 2
    expect(rotated[0].rowIndex).toBe(0); // Giữ nguyên hàng
    expect(rotated[0].studentId).toBe('s1');

    expect(rotated[1].colIndex).toBe(3); // Cột 1 -> Cột 3
    expect(rotated[2].colIndex).toBe(7); // Cột 5 -> Cột 7

    // Đảo lần 2 phải khớp hoàn toàn với vị trí ban đầu
    const rotatedTwice = seatingService.rotateAssignments(rotated);
    expect(rotatedTwice[0].colIndex).toBe(0);
    expect(rotatedTwice[1].colIndex).toBe(1);
    expect(rotatedTwice[2].colIndex).toBe(5);
  });

  it('tính toán tuần học hợp lệ và xác định đúng tuần chẵn / lẻ', () => {
    const weekInfo = seatingService.getCurrentSchoolWeek();
    expect(weekInfo.weekNumber).toBeGreaterThanOrEqual(1);
    expect(['odd', 'even']).toContain(weekInfo.mode);
    expect(weekInfo.mode).toBe(weekInfo.weekNumber % 2 === 1 ? 'odd' : 'even');
  });

  it('tính toán tuần học chính xác khi truyền ngày bắt đầu năm học tùy chỉnh', () => {
    // 1. Cùng ngày hôm nay -> Tuần 1, Tuần lẻ
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const weekToday = seatingService.getCurrentSchoolWeek(todayStr);
    expect(weekToday.weekNumber).toBe(1);
    expect(weekToday.mode).toBe('odd');
    expect(weekToday.startDate).toBe(todayStr);

    // 2. Bắt đầu cách đây 7 ngày (trọn 1 tuần) -> Tuần 2, Tuần chẵn
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoStr = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`;
    const weekTwo = seatingService.getCurrentSchoolWeek(sevenDaysAgoStr);
    expect(weekTwo.weekNumber).toBe(2);
    expect(weekTwo.mode).toBe('even');

    // 3. Bắt đầu cách đây 14 ngày (trọn 2 tuần) -> Tuần 3, Tuần lẻ
    const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgoStr = `${fourteenDaysAgo.getFullYear()}-${String(fourteenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(fourteenDaysAgo.getDate()).padStart(2, '0')}`;
    const weekThree = seatingService.getCurrentSchoolWeek(fourteenDaysAgoStr);
    expect(weekThree.weekNumber).toBe(3);
    expect(weekThree.mode).toBe('odd');

    // 4. Định dạng ngày không hợp lệ -> tự động fallback về mặc định '2026-09-01'
    const weekInvalid = seatingService.getCurrentSchoolWeek('invalid-date');
    expect(weekInvalid.startDate).toBe('2026-09-01');
  });
});

describe('seatingService - clearClassAssignments & Tự động đặt lại Sơ đồ bàn học khi lớp rỗng', () => {
  const testClassId = 'test-clear-seating-class';

  it('xóa sạch cache LocalStorage và phân công chỗ ngồi khi gọi clearClassAssignments', async () => {
    localStorage.setItem(`seating_assignments_${testClassId}`, JSON.stringify([{ id: 'asg-1', studentId: 'hs-1' }]));

    await seatingService.clearClassAssignments(testClassId);

    // Cache chỗ ngồi phải bị xóa sạch
    expect(localStorage.getItem(`seating_assignments_${testClassId}`)).toBeNull();
  });

  it('lưu trữ an toàn danh sách phân công chỗ ngồi qua saveAllAssignments trong sandbox', async () => {
    sandboxService.enableSandbox(true);
    const assignments: SeatAssignmentWithStudent[] = [
      {
        id: 'test-asg-1',
        layoutId: 'lay-test',
        studentId: 'hs-1',
        rowIndex: 1,
        colIndex: 2,
        isHidden: false,
      },
    ];

    try {
      await expect(seatingService.saveAllAssignments('lay-test', assignments)).resolves.not.toThrow();
      const saved = sandboxService.getSeating().assignments;
      expect(saved.length).toBe(1);
      expect(saved[0].studentId).toBe('hs-1');
    } finally {
      sandboxService.disableSandbox();
    }
  });

  it('xử lý an toàn khi lưu và lấy elements_config trong môi trường sandbox hoặc fallback', async () => {
    sandboxService.enableSandbox(true);
    try {
      const config = {
        teacherDeskPosition: 'left' as const,
        doorPosition: 'left' as const,
        doorAngle: 90,
      };

      const saveResult = await seatingService.saveClassroomElementsConfig('test-class-id', config);
      expect(saveResult).toBe(true);

      const fetched = await seatingService.getClassroomElementsConfig('test-class-id');
      expect(fetched).toBeNull(); // Trong sandbox fallback về local storage
    } finally {
      sandboxService.disableSandbox();
    }
  });
});



