import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, type Tournament } from '../services/api'

export function Home() {
  const { data, isLoading, error } = useQuery<{ success: boolean; tournaments: Tournament[] }>({
    queryKey: ['tournaments', 'all'],
    queryFn: () => api.listTournaments(),
  })

  const topBySport = useMemo(() => {
    const groups: Record<string, Tournament[]> = {}
    for (const t of data?.tournaments || []) {
      if (!groups[t.sport]) groups[t.sport] = []
      groups[t.sport].push(t)
    }
    for (const k of Object.keys(groups)) {
      groups[k] = groups[k].slice(0, 2)
    }
    return groups
  }, [data])

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-white drop-shadow">Onchain Fantasy</h1>
        {/* <h2 className="text-xl font-medium text-white drop-shadow">Top Tournaments by Sport</h2> */}
        {isLoading && <p className="text-gray-500">Loading tournaments…</p>}
        {error && <p className="text-red-600">Failed to load tournaments</p>}
        {data && data.tournaments && data.tournaments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No tournaments available yet.</p>
            <p className="text-sm text-gray-400">Create the first tournament to get started!</p>
          </div>
        )}
        <div className="space-y-6">
          {Object.entries(topBySport).map(([sport, list]) => (
            <div key={sport} className="space-y-2">
              <h3 className="text-lg font-semibold capitalize text-white drop-shadow">{sport}</h3>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((t) => (
                  <li key={t.tournament_id} className="rounded-lg border border-amber-800 bg-amber-700/90 text-white p-4 shadow-md">
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
                    <div className="text-xs text-gray-600 mt-1">
                      {t.participants}/{t.max_participants} participants
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}



