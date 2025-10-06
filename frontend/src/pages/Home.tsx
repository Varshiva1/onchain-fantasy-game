import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

export function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['contests', 'cricket'],
    queryFn: () => api.listContests('cricket'),
  })

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Onchain Fantasy</h1>
        <h2 className="text-xl font-medium">Featured Contests</h2>
        {isLoading && <p className="text-gray-500">Loading contests…</p>}
        {error && <p className="text-red-600">Failed to load contests</p>}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data?.contests?.map((c) => (
            <li key={c.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <strong className="text-gray-900">{c.name}</strong>
                <span className="text-xs text-gray-500 uppercase tracking-wide">{c.sport}</span>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                Entry: <span className="font-medium">{c.entry_fee}</span>
              </div>
              <div className="text-sm text-gray-700">
                Prize Pool: <span className="font-medium">{c.prize_pool}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}



