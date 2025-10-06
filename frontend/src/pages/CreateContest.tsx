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
    <div className="max-w-xl">
      <h2 className="mb-4 text-xl font-semibold">Create Contest</h2>
      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">Name</span>
          <input
            className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">Sport</span>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
          >
            <option value="cricket">Cricket</option>
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">Entry Fee</span>
          <input
            type="number"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            value={entryFee}
            onChange={(e) => setEntryFee(parseInt(e.target.value) || 0)}
          />
        </label>
        <button type="submit" className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Create
        </button>
      </form>
    </div>
  )
}



