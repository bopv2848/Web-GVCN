import type { Student } from '../../../types/student';

export interface BattleTeam {
  name: string;
  aisleName: string;
  deskLabel: string;
  seatKeys: string[];
  students: Student[];
  color: 'sky' | 'amber';
}

export interface BattleMatch {
  id: string;
  teamA: BattleTeam;
  teamB: BattleTeam;
  label: string;
  uncalledCountTeamA?: number;
  uncalledCountTeamB?: number;
}
