import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api, type Tournament } from '../services/api'

export function Home() {
  const { data, isLoading, error } = useQuery<{ tournaments: Tournament[] }>({
    queryKey: ['tournaments', 'all'],
    queryFn: () => api.listTournaments(),
  })

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Onchain Fantasy</h1>
        <h2 className="text-xl font-medium">Tournaments</h2>
        {isLoading && <p className="text-gray-500">Loading tournaments…</p>}
        {error && <p className="text-red-600">Failed to load tournaments</p>}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data?.tournaments?.map((t) => (
            <li key={t.tournament_id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <strong className="text-gray-900">{t.name}</strong>
                <span className="text-xs text-gray-500 uppercase tracking-wide">{t.sport}</span>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                Entry: <span className="font-medium">{t.entry_fee} ETH</span>
              </div>
              <div className="text-sm text-gray-700">
                Prize Pool: <span className="font-medium">{t.prize_pool} ETH</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}



