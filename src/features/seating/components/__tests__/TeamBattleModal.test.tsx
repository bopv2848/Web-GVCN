import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TeamBattleModal } from '../TeamBattleModal';
import type { BattleMatch } from '../../types/battleTypes';

const mockBattle: BattleMatch = {
  id: 'battle_1',
  label: 'DÃY 1 vs DÃY 2',
  teamA: {
    name: 'ĐỘI CHIẾN BINH DÃY 1',
    aisleName: '1',
    deskLabel: 'Bàn 1',
    seatKeys: ['0_0', '0_1'],
    students: [
      { id: 'st1', fullName: 'Nguyễn Văn An', groupName: 'Tổ 1', gender: 'Nam' } as any,
      { id: 'st2', fullName: 'Trần Thị Bình', groupName: 'Tổ 1', gender: 'Nữ' } as any,
    ],
    color: 'sky',
  },
  teamB: {
    name: 'ĐỘI CHIẾN BINH DÃY 2',
    aisleName: '2',
    deskLabel: 'Bàn 1',
    seatKeys: ['0_3', '0_4'],
    students: [
      { id: 'st3', fullName: 'Lê Văn Cường', groupName: 'Tổ 2', gender: 'Nam' } as any,
      { id: 'st4', fullName: 'Phạm Thị Dung', groupName: 'Tổ 2', gender: 'Nữ' } as any,
    ],
    color: 'amber',
  },
};

describe('TeamBattleModal Component', () => {
  it('không render khi isOpen = false', () => {
    const { container } = render(
      <TeamBattleModal
        isOpen={false}
        battle={mockBattle}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('hiển thị đầy đủ thông tin 2 đội đối kháng khi isOpen = true', () => {
    render(
      <TeamBattleModal
        isOpen={true}
        battle={mockBattle}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/CUỘC ĐỐI ĐẦU 2 DÃY:/i)).toBeInTheDocument();
    expect(screen.getByText('DÃY 1 vs DÃY 2')).toBeInTheDocument();

    // Thông tin Đội A
    expect(screen.getByText('ĐỘI CHIẾN BINH DÃY 1')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn An')).toBeInTheDocument();
    expect(screen.getByText('Trần Thị Bình')).toBeInTheDocument();

    // Thông tin Đội B
    expect(screen.getByText('ĐỘI CHIẾN BINH DÃY 2')).toBeInTheDocument();
    expect(screen.getByText('Lê Văn Cường')).toBeInTheDocument();
    expect(screen.getByText('Phạm Thị Dung')).toBeInTheDocument();
  });

  it('gọi onAwardPoints khi bấm nút thưởng điểm cho Đội A', async () => {
    const handleAward = vi.fn().mockResolvedValue(undefined);
    render(
      <TeamBattleModal
        isOpen={true}
        battle={mockBattle}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
        onAwardPoints={handleAward}
      />
    );

    const awardBtnA = screen.getByRole('button', { name: /\+5 Điểm Đội A Thắng/i });
    fireEvent.click(awardBtnA);

    expect(handleAward).toHaveBeenCalledWith('teamA', 5, expect.any(String));
  });

  it('gọi onAwardPoints khi bấm nút thưởng điểm cho Đội B', async () => {
    const handleAward = vi.fn().mockResolvedValue(undefined);
    render(
      <TeamBattleModal
        isOpen={true}
        battle={mockBattle}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
        onAwardPoints={handleAward}
      />
    );

    const awardBtnB = screen.getByRole('button', { name: /\+5 Điểm Đội B Thắng/i });
    fireEvent.click(awardBtnB);

    expect(handleAward).toHaveBeenCalledWith('teamB', 5, expect.any(String));
  });

  it('gọi onAwardPoints khi bấm nút Hòa', async () => {
    const handleAward = vi.fn().mockResolvedValue(undefined);
    render(
      <TeamBattleModal
        isOpen={true}
        battle={mockBattle}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
        onAwardPoints={handleAward}
      />
    );

    const drawBtn = screen.getByRole('button', { name: /🤝 Hòa \(\+3đ\)/i });
    fireEvent.click(drawBtn);

    expect(handleAward).toHaveBeenCalledWith('both', 3, expect.any(String));
  });

  it('gọi onAssignTask khi chọn thử thách đối kháng', () => {
    const handleAssign = vi.fn();
    render(
      <TeamBattleModal
        isOpen={true}
        battle={mockBattle}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
        onAssignTask={handleAssign}
      />
    );

    const taskBtn = screen.getByRole('button', { name: /🎤 Tranh biện chủ đề tiết sinh hoạt/i });
    fireEvent.click(taskBtn);

    expect(handleAssign).toHaveBeenCalledWith('🎤 Tranh biện chủ đề tiết sinh hoạt');
  });

  it('kích hoạt onSpinAgain và onClose khi bấm các nút điều khiển', () => {
    const handleSpin = vi.fn();
    const handleClose = vi.fn();
    render(
      <TeamBattleModal
        isOpen={true}
        battle={mockBattle}
        onSpinAgain={handleSpin}
        onClose={handleClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Bốc Cặp Đấu Khác/i }));
    expect(handleSpin).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Đóng \(ESC\)/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('hiển thị huy hiệu học sinh mới cho 2 đội khi có uncalledCountTeamA/B', () => {
    const battleWithPriority: BattleMatch = {
      ...mockBattle,
      uncalledCountTeamA: 2,
      uncalledCountTeamB: 1,
    };

    render(
      <TeamBattleModal
        isOpen={true}
        battle={battleWithPriority}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/⭐ 100% Mới/i)).toBeInTheDocument();
    expect(screen.getByText(/⭐ 1\/2 mới/i)).toBeInTheDocument();
  });

  it('hỗ trợ bộ bấm giờ đấu trí đối kháng với các mốc 30s, 1p, 2p, 3p, 5p, 7p và tùy chỉnh phút', () => {
    render(
      <TeamBattleModal
        isOpen={true}
        battle={mockBattle}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/⏱️ Hẹn giờ thi:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1 Phút' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2 Phút' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3 Phút' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5 Phút' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7 Phút' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /✏️ Tùy chỉnh phút/i })).toBeInTheDocument();

    // Chọn mốc 2 Phút
    fireEvent.click(screen.getByRole('button', { name: '2 Phút' }));
    expect(screen.getByText('02:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /⏸️ Dừng/i })).toBeInTheDocument();

    // Tạm dừng
    fireEvent.click(screen.getByRole('button', { name: /⏸️ Dừng/i }));
    expect(screen.getByRole('button', { name: /▶️ Tiếp/i })).toBeInTheDocument();

    // Đặt lại
    fireEvent.click(screen.getByRole('button', { name: /🔄/i }));
    expect(screen.getByText(/⏱️ Hẹn giờ thi:/i)).toBeInTheDocument();
  });

  it('hỗ trợ nhập số phút tùy chỉnh cho trận đấu đối kháng thuyết trình lớn', () => {
    render(
      <TeamBattleModal
        isOpen={true}
        battle={mockBattle}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /✏️ Tùy chỉnh phút/i }));
    const input = screen.getByPlaceholderText(/Số phút/i);
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /Bắt đầu/i }));

    expect(screen.getByText('05:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /⏸️ Dừng/i })).toBeInTheDocument();
  });

  it('tự động gợi ý và cộng thêm +1đ Thưởng tốc độ khi Đội A thắng trước khi hết giờ', () => {
    const handleAward = vi.fn().mockResolvedValue(undefined);
    render(
      <TeamBattleModal
        isOpen={true}
        battle={mockBattle}
        onSpinAgain={vi.fn()}
        onClose={vi.fn()}
        onAwardPoints={handleAward}
      />
    );

    // Kích hoạt đồng hồ 1 Phút
    fireEvent.click(screen.getByRole('button', { name: '1 Phút' }));

    // Hiển thị huy hiệu tốc độ
    expect(screen.getAllByText(/⚡ Còn 01:00/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText(/\+1đ Tốc độ/i).length).toBeGreaterThanOrEqual(1);

    // Nút thưởng Đội A tự chuyển thành +6 điểm (+1đ tốc độ)
    const awardBtnA = screen.getByRole('button', { name: /\+6 Điểm Đội A Thắng/i });
    expect(awardBtnA).toBeInTheDocument();

    fireEvent.click(awardBtnA);
    expect(handleAward).toHaveBeenCalledWith('teamA', 6, expect.stringContaining('thưởng tốc độ phản xạ'));
  });
});
