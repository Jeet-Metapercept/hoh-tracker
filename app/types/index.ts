export type Link = {
  name: string;
  icon?: string;
  to: string;
};

export type LinkGroup = {
  name: string;
  links: Link[];
};

export interface HohData {
  id: number;
  step: string;
  status: boolean;
  process: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * One derived Atlantis energy row for the board (mirrors the bot's PlayerEnergy in
 * atlantis/src/players/players.ts). Energy is derived, not stored; `nextRegenAt` is
 * the ISO instant of the next +1 tick, or null when the player is full (5/5).
 */
export interface PlayerEnergy {
  name: string;
  is_member: boolean;
  energy: number;
  attacksSince: number;
  lastAttackAt: string | null;
  nextRegenAt: string | null;
  season_id: string;
  /** True if this player has any DAMAGE/BREACH in this season's battle logs. */
  inSeasonLogs: boolean;
}
