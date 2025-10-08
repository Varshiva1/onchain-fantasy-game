const BASE_URL =import.meta.env.VITE_BACKEND_URL ||(window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://onchain-fantasy-game-d1fm.vercel.app');

export type Contest = {
  id: string;
  sport: string;
  name: string;
  entry_fee: number;
  prize_pool: number;
};

export type Tournament = {
  tournament_id: string;
  name: string;
  sport: string;
  entry_fee: string;
  prize_pool: string;
  status: string;
  participants: number;
  max_participants: number;
  contract_address: string;
  creator_address: string;
  end_time: string;
  created_at: string;
};

export type CreateTournamentRequest = {
  name: string;
  sport: string;
  entry_fee: string;
  prize_pool: string;
  end_time: string;
  creator_address: string;
  status?: string;
  participants?: number;
  max_participants?: number;
};

export type JoinTournamentRequest = {
  user_address: string;
  amount: string;
};

export const api = {
  async health() {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json() as Promise<{ status: string; timestamp: string; service: string }>;
  },

  async listSports() {
    const res = await fetch(`${BASE_URL}/api/sports`);
    return res.json() as Promise<{ sports: { sport_id: string; name: string; icon: string }[] }>;
  },

  async listContests(sport: string) {
    const res = await fetch(`${BASE_URL}/api/contests?sport=${encodeURIComponent(sport)}`);
    return res.json() as Promise<{ contests: Contest[] }>;
  },

  async listTournaments(sport?: string) {
    const url = sport
      ? `${BASE_URL}/api/tournaments?sport=${encodeURIComponent(sport)}`
      : `${BASE_URL}/api/tournaments`;
    console.log('Fetching tournaments from:', url);
    const res = await fetch(url);
    console.log('Tournaments response status:', res.status);
    const data = (await res.json()) as { success: boolean; tournaments: Tournament[] };
    console.log('Tournaments data:', data);
    return data;
  },

  async getTournament(id: string) {
    const res = await fetch(`${BASE_URL}/api/tournaments/${id}`);
    return res.json() as Promise<{ tournament: Tournament } | { error: string }>;
  },

  async createTournament(data: CreateTournamentRequest) {
    console.log('Creating tournament with data:', data);
    console.log('Backend URL:', BASE_URL);

    const res = await fetch(`${BASE_URL}/api/tournaments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    console.log('Response status:', res.status);
    const result = await res.json();
    console.log('Response data:', result);

    return result as Promise<{
      success: boolean;
      tournament?: Tournament;
      message?: string;
      error?: string;
      blockchain?: { contract_address: string; transaction_hash: string };
    }>;
  },

  async joinTournament(id: string, data: JoinTournamentRequest) {
    const res = await fetch(`${BASE_URL}/api/tournaments/${id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json() as Promise<{
      success: boolean;
      message: string;
      tournament?: Tournament;
      transaction_hash?: string;
    }>;
  },

  async getTournamentParticipants(id: string) {
    const res = await fetch(`${BASE_URL}/api/tournaments/${id}/participants`);
    return res.json() as Promise<{ participants: any[] }>;
  },
};
