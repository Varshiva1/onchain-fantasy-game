import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, type Tournament } from '../../services/api'

const sports = ['cricket', 'football', 'tennis', 'basketball', 'hockey', 'badminton']

export function MarketsList() {
    const [params] = useSearchParams()
    const initial = params.get('sport') || 'cricket'
    const [selectedSport, setSelectedSport] = useState<string>(initial)
    const { data, isLoading, error } = useQuery<{ tournaments: Tournament[] }>({
        queryKey: ['tournaments', selectedSport],
        queryFn: () => api.listTournaments(selectedSport),
    })

	return (
		<div className="space-y-4">
            <div className="flex items-center justify-between">
            Navbar   <h2 className="text-xl font-semibold text-black drop-shadow">Markets</h2>
            </div>

            <div className="flex flex-wrap gap-3">
                {sports.map((s) => (
                    <button
                        key={s}
                        onClick={() => setSelectedSport(s)}
                        className={`rounded-full px-6 py-2.5 text-sm font-semibold border shadow-sm transition-colors ${
                            selectedSport === s
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-amber-100 text-slate-800 border-green-300 hover:bg-green-200'
                        }`}
                    >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>
            {isLoading && <p className="text-sm text-gray-500">Loading tournaments…</p>}
            {error && <p className="text-sm text-red-600">Failed to load tournaments</p>}
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data?.tournaments?.filter(t => t.status === 'Active').map((t) => (
                    <li key={t.tournament_id} className="rounded-lg border border-amber-800 bg-amber-700/90 text-white p-4 shadow-md">
                        <div className="flex items-center justify-between">
                            <strong className="text-white">{t.name}</strong>
                            <span className="text-xs text-white/80">{t.participants}/{t.max_participants}</span>
                        </div>
                        <div className="mt-2 text-sm text-white/90">Entry: {t.entry_fee} ETH</div>
                        <div className="text-sm text-white/90">Prize: {t.prize_pool} ETH</div>
                    </li>
                ))}
            </ul>
		</div>
	)
}
