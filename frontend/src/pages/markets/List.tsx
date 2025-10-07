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
                <h2 className="text-xl font-semibold">Markets</h2>
            </div>

            <div className="flex flex-wrap gap-2">
                {sports.map((s) => (
                    <button
                        key={s}
                        onClick={() => setSelectedSport(s)}
                        className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                            selectedSport === s
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-indigo-50 hover:border-indigo-300'
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
                    <li key={t.tournament_id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <strong className="text-gray-900">{t.name}</strong>
                            <span className="text-xs text-gray-500">{t.participants}/{t.max_participants}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">Entry: {t.entry_fee} ETH</div>
                        <div className="text-sm text-gray-700">Prize: {t.prize_pool} ETH</div>
                    </li>
                ))}
            </ul>
		</div>
	)
}
