import { useState } from 'react'

export function CreateContest() {
  const [name, setName] = useState('')
  const [entryFee, setEntryFee] = useState(0)
  const [sport, setSport] = useState('cricket')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    alert(`Contest created: ${name} (${sport}) entry ${entryFee}`)
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Create Contest</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
        <label>
          <span>Name</span>
          <input
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          <span>Sport</span>
          <select value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="cricket">Cricket</option>
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
          </select>
        </label>
        <label>
          <span>Entry Fee</span>
          <input type="number" value={entryFee} onChange={(e) => setEntryFee(parseInt(e.target.value) || 0)} />
        </label>
        <button type="submit">Create</button>
      </form>
    </div>
  )
}


