const BASE_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:8080'

export type Contest = {
  id: string
  sport: string
  name: string
  entry_fee: number
  prize_pool: number
}

export const api = {
  async health() {
    const res = await fetch(`${BASE_URL}/health`)
    return res.json() as Promise<{ status: string }>
  },
  async listSports() {
    const res = await fetch(`${BASE_URL}/sports`)
    return res.json() as Promise<{ sports: { id: string; name: string }[] }>
  },
  async listContests(sport: string) {
    const res = await fetch(`${BASE_URL}/contests?sport=${encodeURIComponent(sport)}`)
    return res.json() as Promise<{ contests: Contest[] }>
  },
}


