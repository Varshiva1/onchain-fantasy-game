import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

export function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['contests', 'cricket'],
    queryFn: () => api.listContests('cricket'),
  })

  return (
    <div style={{ padding: 16, fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Onchain Fantasy</h1>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Home</Link>
          <Link to="/create">Create Contest</Link>
          <Link to="/teams">My Teams</Link>
        </nav>
      </header>
      <section>
        <h2>Featured Contests</h2>
        {isLoading && <p>Loading contests…</p>}
        {error && <p>Failed to load contests</p>}
        <ul>
          {data?.contests?.map((c) => (
            <li key={c.id}>
              <strong>{c.name}</strong> — Entry: {c.entry_fee} — Prize Pool: {c.prize_pool}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}


