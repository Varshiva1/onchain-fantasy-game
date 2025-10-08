export interface Tournament {
  _id?: string;
  tournament_id: string;
  name: string;
  sport: string;
  entry_fee: string;
  prize_pool: string;
  status: TournamentStatus;
  participants: number;
  max_participants: number;
  contract_address: string;
  creator_address: string;
  end_time: Date;
  created_at: Date;
  updated_at: Date;
}

export enum TournamentStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface CreateTournamentRequest {
  name: string;
  sport: string;
  entry_fee: string;
  prize_pool: string;
  end_time: string;
  creator_address: string;
  status?: string;
  participants?: number;
  max_participants?: number;
}

export interface JoinTournamentRequest {
  user_address: string;
  amount: string;
}

export interface Participant {
  _id?: string;
  tournament_id: string;
  user_address: string;
  amount_paid: string;
  transaction_hash: string;
  joined_at: Date;
}

export interface TournamentResponse {
  success: boolean;
  tournament?: Tournament;
  message?: string;
  error?: string;
}

export interface JoinTournamentResponse {
  success: boolean;
  message: string;
  transaction_hash?: string;
  tournament?: Tournament;
}
