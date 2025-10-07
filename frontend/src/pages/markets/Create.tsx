import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { api, type Tournament, type CreateTournamentRequest, type JoinTournamentRequest } from '../../services/api'

const sports = [
	{ id: 'cricket', name: 'Cricket', icon: '🏏' },
	{ id: 'football', name: 'Football', icon: '⚽' },
	{ id: 'tennis', name: 'Tennis', icon: '🎾' },
	{ id: 'basketball', name: 'Basketball', icon: '🏀' },
	{ id: 'hockey', name: 'Hockey', icon: '🏒' },
	{ id: 'badminton', name: 'Badminton', icon: '🏸' },
]


export function CreateMarket() {
	const { isConnected, address } = useAccount()
	const [selectedSport, setSelectedSport] = useState<string>('')
	const [action, setAction] = useState<'create' | 'join' | null>(null)
	const [question, setQuestion] = useState('')
	const [endTime, setEndTime] = useState<string>('')
	const [liquidity, setLiquidity] = useState<string>('')
	const [showJoinConfirm, setShowJoinConfirm] = useState(false)
	const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
	const [tournaments, setTournaments] = useState<Tournament[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [isCreating, setIsCreating] = useState(false)

	// Load tournaments when component mounts or sport changes
	useEffect(() => {
		if (action === 'join' && selectedSport) {
			loadTournaments()
		}
	}, [action, selectedSport])

	async function loadTournaments() {
		setIsLoading(true)
		try {
			const response = await api.listTournaments()
			// Filter tournaments by sport
			const filteredTournaments = response.tournaments.filter(t => t.sport === selectedSport)
			setTournaments(filteredTournaments)
		} catch (error) {
			console.error('Failed to load tournaments:', error)
			alert('Failed to load tournaments')
		} finally {
			setIsLoading(false)
		}
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		if (!isConnected || !address) return alert('Connect a wallet')
		if (!endTime) return alert('Pick end time')
		if (!question) return alert('Enter tournament name')
		if (!liquidity) return alert('Enter entry fee')

		setIsCreating(true)
		try {
			const tournamentData: CreateTournamentRequest = {
				name: question,
				sport: selectedSport,
				entry_fee: liquidity,
				prize_pool: liquidity, // For now, same as entry fee
				end_time: new Date(endTime).toISOString(),
				creator_address: address,
			}

			const response = await api.createTournament(tournamentData)
			
			if (response.success) {
				alert('Tournament created successfully!')
				// Reset form
				setQuestion('')
				setEndTime('')
				setLiquidity('')
				// Reload tournaments
				loadTournaments()
			} else {
				alert(`Failed to create tournament: ${response.error || 'Unknown error'}`)
			}
		} catch (error) {
			console.error('Error creating tournament:', error)
			alert('Failed to create tournament')
		} finally {
			setIsCreating(false)
		}
	}

	async function joinTournament(tournament: Tournament) {
		if (!isConnected || !address) return alert('Connect a wallet')
		
		setSelectedTournament(tournament)
		setShowJoinConfirm(true)
	}

	async function confirmJoin() {
		if (!selectedTournament || !address) return
		
		try {
			const joinData: JoinTournamentRequest = {
				user_address: address,
				amount: selectedTournament.entry_fee,
			}

			const response = await api.joinTournament(selectedTournament.tournament_id, joinData)
			
			if (response.success) {
				alert('Successfully joined tournament!')
				setShowJoinConfirm(false)
				setSelectedTournament(null)
				// Reload tournaments to update participant count
				loadTournaments()
			} else {
				alert(`Failed to join tournament: ${response.message}`)
			}
		} catch (error) {
			console.error('Error joining tournament:', error)
			alert('Failed to join tournament. Please try again.')
		}
	}

	if (!selectedSport) {
		return (
			<div className="w-full">
				<div className="mb-8">
					<h1 className="text-3xl font-semibold tracking-tight text-slate-900">Choose Your Sport</h1>
					<p className="mt-1 text-sm text-slate-800">Select a sport to create or join tournaments.</p>
				</div>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 h-[52vh]">
					{sports.map((sport) => (
						<button
							key={sport.id}
							onClick={() => setSelectedSport(sport.id)}
							className="flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-300 bg-white p-6 shadow-sm hover:border-slate-400 hover:shadow-md h-full"
						>
							<span className="text-5xl">{sport.icon}</span>
							<span className="font-semibold text-slate-900 text-xl">{sport.name}</span>
						</button>
					))}
				</div>
			</div>
		)
	}

	if (!action) {
		const sport = sports.find(s => s.id === selectedSport)
		return (
			<div className="w-full">
				<div className="mb-8">
					<button onClick={() => setSelectedSport('')} className="mb-4 text-sm text-slate-600 hover:text-slate-900">← Back to Sports</button>
					<h1 className="text-3xl font-semibold tracking-tight text-slate-900">{sport?.name} Tournaments</h1>
					<p className="mt-1 text-sm text-slate-800">Choose what you want to do with {sport?.name}.</p>
				</div>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 h-[52vh]">
					<button
						onClick={() => setAction('create')}
						className="flex flex-col items-center justify-center gap-6 rounded-xl border border-slate-300 bg-white p-8 shadow-sm hover:border-slate-400 hover:shadow-md h-full"
					>
						<div className="text-6xl">🏆</div>
						<div className="text-center">
							<h3 className="text-2xl font-semibold text-slate-900">Create Tournament</h3>
							<p className="text-base text-slate-600 mt-2">Start a new fantasy tournament</p>
						</div>
					</button>
					<button
						onClick={() => setAction('join')}
						className="flex flex-col items-center justify-center gap-6 rounded-xl border border-slate-300 bg-white p-8 shadow-sm hover:border-slate-400 hover:shadow-md h-full"
					>
						<div className="text-6xl">👥</div>
						<div className="text-center">
							<h3 className="text-2xl font-semibold text-slate-900">Join Tournament</h3>
							<p className="text-base text-slate-600 mt-2">Participate in existing tournaments</p>
						</div>
					</button>
				</div>
			</div>
		)
	}

	return (
		<>
		<div className="w-full">
			<div className="mb-8">
				<button onClick={() => setAction(null)} className="mb-4 text-sm text-slate-600 hover:text-slate-900">← Back to Actions</button>
				<h1 className="text-3xl font-semibold tracking-tight text-slate-900">
					{action === 'create' ? 'Create' : 'Join'} {sports.find(s => s.id === selectedSport)?.name} Tournament
				</h1>
				<p className="mt-1 text-sm text-slate-800">
					{action === 'create' ? 'Define the tournament details and rules.' : 'Find and join existing tournaments.'}
				</p>
			</div>
			{action === 'create' ? (
				<form onSubmit={submit} className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
					<label className="grid gap-1 text-sm">
						<span className="font-medium text-slate-900">Tournament Name</span>
						<input className="rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-slate-600" value={question} onChange={(e) => setQuestion(e.target.value)} required />
					</label>
					<label className="grid gap-1 text-sm">
						<span className="font-medium text-slate-900">End time</span>
						<input type="datetime-local" className="rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-slate-600" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
					</label>
					<label className="grid gap-1 text-sm">
						<span className="font-medium text-slate-900">Entry Fee (ETH)</span>
						<input type="number" min="0" step="0.001" className="rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-slate-600" value={liquidity} onChange={(e) => setLiquidity(e.target.value)} />
					</label>
					<div className="col-span-full mt-2 flex items-center gap-3">
						<button type="submit" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black" disabled={isCreating}>
							{isCreating ? 'Creating...' : 'Create Tournament'}
						</button>
						<span className="text-xs text-slate-700/90">Tournament will be created on blockchain.</span>
					</div>
				</form>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{isLoading ? (
						<div className="col-span-full text-center py-8">
							<p className="text-slate-600">Loading tournaments...</p>
						</div>
					) : tournaments.length === 0 ? (
						<div className="col-span-full text-center py-8">
							<p className="text-slate-600">No tournaments available for {sports.find(s => s.id === selectedSport)?.name}</p>
						</div>
					) : (
						tournaments.map((tournament) => (
							<div key={tournament.tournament_id} className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
								<h3 className="font-semibold text-slate-900">{tournament.name}</h3>
								<p className="text-sm text-slate-600">Entry: {tournament.entry_fee} ETH</p>
								<p className="text-sm text-slate-600">Prize: {tournament.prize_pool} ETH</p>
								<p className="text-sm text-slate-600">Participants: {tournament.participants}/{tournament.max_participants}</p>
								<p className="text-sm text-slate-600">Status: {tournament.status}</p>
								<button 
									onClick={() => joinTournament(tournament)}
									className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-black"
									disabled={tournament.status !== 'Active' || tournament.participants >= tournament.max_participants}
								>
									{tournament.status !== 'Active' ? 'Inactive' : 
									 tournament.participants >= tournament.max_participants ? 'Full' : 'Join'}
								</button>
							</div>
						))
					)}
				</div>
			)}
		</div>
		
		{/* Join Confirmation Popup */}
		{showJoinConfirm && selectedTournament && (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
				<div className="rounded-xl bg-white p-6 shadow-lg max-w-md w-full mx-4">
					<h3 className="text-lg font-semibold text-slate-900 mb-4">Join Tournament</h3>
					<p className="text-sm text-slate-600 mb-2">
						Do you want to join the tournament <strong>"{selectedTournament.name}"</strong>?
					</p>
					<p className="text-sm text-slate-600 mb-4">
						Entry fee: <strong>{selectedTournament.entry_fee} ETH</strong>
					</p>
					<div className="flex gap-3">
						<button
							onClick={confirmJoin}
							className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
							disabled={isCreating}
						>
							{isCreating ? 'Processing...' : 'Yes, Join'}
						</button>
						<button
							onClick={() => {
								setShowJoinConfirm(false)
								setSelectedTournament(null)
							}}
							className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
							disabled={isCreating}
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		)}
	</>
	)
}

