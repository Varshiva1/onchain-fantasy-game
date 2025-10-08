import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type CreateTournamentRequest } from '../services/api'
import { WalletConnect } from '../components/WalletConnect'

export function CreateContest() {
  const [name, setName] = useState('')
  const [entryFee, setEntryFee] = useState('0')
  const [prizePool, setPrizePool] = useState('0')
  const [sport, setSport] = useState('cricket')
  const [endTime, setEndTime] = useState('')
  const [creatorAddress, setCreatorAddress] = useState('')
  const [walletConnected, setWalletConnected] = useState(false)
  const [maxParticipants, setMaxParticipants] = useState(100)
  const [status, setStatus] = useState('Active')
  const [participants, setParticipants] = useState(0)

  const queryClient = useQueryClient()

  const handleWalletAddressChange = (address: string) => {
    setCreatorAddress(address)
    setWalletConnected(!!address)
  }

  const createTournamentMutation = useMutation({
    mutationFn: (data: CreateTournamentRequest) => api.createTournament(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tournaments'] })
        alert(`Tournament created successfully!\nContract Address: ${response.tournament?.contract_address}\nBlockchain Transaction: ${response.blockchain?.transaction_hash}`)
        // Reset form
        setName('')
        setEntryFee('0')
        setPrizePool('0')
        setEndTime('')
        setCreatorAddress('')
        setMaxParticipants(100)
        setStatus('Active')
        setParticipants(0)
      } else {
        alert(`Failed to create tournament: ${response.error || 'Unknown error'}`)
      }
    },
    onError: (error) => {
      console.error('Error creating tournament:', error)
      alert('Failed to create tournament. Please check your connection and try again.')
    }
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!name || !entryFee || !prizePool || !endTime) {
      alert('Please fill in all required fields')
      return
    }

    if (!walletConnected) {
      alert('Please connect your wallet first')
      return
    }

    const tournamentData: CreateTournamentRequest = {
      name,
      sport,
      entry_fee: entryFee,
      prize_pool: prizePool,
      end_time: endTime,
      creator_address: creatorAddress,
      max_participants: maxParticipants,
      status: status,
      participants: participants
    }

    createTournamentMutation.mutate(tournamentData)
  }

  return (
    <div className="max-w-xl">
      <h2 className="mb-4 text-xl font-semibold">Create Tournament</h2>
      
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Wallet Connection</h3>
        <WalletConnect onAddressChange={handleWalletAddressChange} />
        {walletConnected && (
          <p className="text-xs text-green-600 mt-1">✓ Wallet connected</p>
        )}
      </div>

      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">Tournament Name *</span>
          <input
            className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
          />
        </label>
        
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">Sport *</span>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
          >
            <option value="cricket">Cricket</option>
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="tennis">Tennis</option>
          </select>
        </label>
        
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">Entry Fee (ETH) *</span>
          <input
            type="text"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
            placeholder="0.01"
            required
          />
        </label>
        
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">Prize Pool (ETH) *</span>
          <input
            type="text"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            value={prizePool}
            onChange={(e) => setPrizePool(e.target.value)}
            placeholder="0.1"
            required
          />
        </label>
        
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">End Time *</span>
          <input
            type="datetime-local"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </label>
        
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">Creator Address *</span>
          <input
            type="text"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            value={creatorAddress}
            onChange={(e) => setCreatorAddress(e.target.value)}
            placeholder="0x..."
            disabled={walletConnected}
            required
          />
          {walletConnected && (
            <p className="text-xs text-gray-500">Address from connected wallet</p>
          )}
        </label>
        
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">Max Participants</span>
          <input
            type="number"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 100)}
            min="2"
            max="1000"
          />
        </label>
        
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">Status</span>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </label>
        
        <label className="grid gap-1 text-sm">
          <span className="text-gray-700">Initial Participants</span>
          <input
            type="number"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            value={participants}
            onChange={(e) => setParticipants(parseInt(e.target.value) || 0)}
            min="0"
            max={maxParticipants}
          />
        </label>
        
        <button 
          type="submit" 
          disabled={createTournamentMutation.isPending || !walletConnected}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createTournamentMutation.isPending ? 'Creating Tournament & Deploying Contract...' : 'Create Tournament'}
        </button>
        
        {!walletConnected && (
          <p className="text-xs text-red-600">Please connect your wallet to create a tournament</p>
        )}
      </form>
    </div>
  )
}



