import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { FACTORY_ADDRESS, FactoryAbi, MarketAbi } from '../../lib/contracts'

const sports = [
	{ id: 'cricket', name: 'Cricket', icon: '🏏' },
	{ id: 'football', name: 'Football', icon: '⚽' },
	{ id: 'tennis', name: 'Tennis', icon: '🎾' },
	{ id: 'basketball', name: 'Basketball', icon: '🏀' },
	{ id: 'hockey', name: 'Hockey', icon: '🏒' },
	{ id: 'badminton', name: 'Badminton', icon: '🏸' },
]

// Mock tournament data - in a real app, this would come from the contract
const mockTournaments = [
	{ id: 1, name: 'Cricket World Cup 2024', entryFee: '0.01', prizePool: '0.1', address: '0x1234567890123456789012345678901234567890' },
	{ id: 2, name: 'Premier League Fantasy', entryFee: '0.02', prizePool: '0.2', address: '0x2345678901234567890123456789012345678901' },
	{ id: 3, name: 'Tennis Grand Slam', entryFee: '0.005', prizePool: '0.05', address: '0x3456789012345678901234567890123456789012' },
	{ id: 4, name: 'NBA Championship', entryFee: '0.03', prizePool: '0.3', address: '0x4567890123456789012345678901234567890123' },
	{ id: 5, name: 'Hockey League', entryFee: '0.015', prizePool: '0.15', address: '0x5678901234567890123456789012345678901234' },
	{ id: 6, name: 'Badminton Open', entryFee: '0.008', prizePool: '0.08', address: '0x6789012345678901234567890123456789012345' },
]

export function CreateMarket() {
	const { isConnected } = useAccount()
	const { writeContractAsync, isPending } = useWriteContract()
	const [selectedSport, setSelectedSport] = useState<string>('')
	const [action, setAction] = useState<'create' | 'join' | null>(null)
	const [question, setQuestion] = useState('')
	const [endTime, setEndTime] = useState<string>('')
	const [liquidity, setLiquidity] = useState<string>('')
	const [showJoinConfirm, setShowJoinConfirm] = useState(false)
	const [selectedTournament, setSelectedTournament] = useState<any>(null)

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		if (!isConnected) return alert('Connect a wallet')
		if (!endTime) return alert('Pick end time')
		const endTs = Math.floor(new Date(endTime).getTime() / 1000)
		const valueWei = BigInt(Math.floor(parseFloat(liquidity) * 1e18))
		await writeContractAsync({
			address: FACTORY_ADDRESS,
			abi: FactoryAbi as any,
			functionName: 'createMarket',
			args: [question, BigInt(endTs)],
			value: valueWei,
		})
		alert('Market transaction sent')
	}

	async function joinTournament(tournament: any) {
		if (!isConnected) return alert('Connect a wallet')
		
		setSelectedTournament(tournament)
		setShowJoinConfirm(true)
	}

	async function confirmJoin() {
		if (!selectedTournament) return
		
		try {
			const valueWei = BigInt(Math.floor(parseFloat(selectedTournament.entryFee) * 1e18))
			
			// For now, we'll use buyYes as the join mechanism
			// In a real implementation, you'd have a specific join function
			await writeContractAsync({
				address: selectedTournament.address as `0x${string}`,
				abi: MarketAbi as any,
				functionName: 'buyYes',
				args: [],
				value: valueWei,
			})
			
			alert('Successfully joined tournament!')
			setShowJoinConfirm(false)
			setSelectedTournament(null)
		} catch (error) {
			console.error('Error joining tournament:', error)
			alert('Failed to join tournament. Please try again.')
		}
	}

	if (!selectedSport) {
		return (
			<div className="w-full">
				<div className="mb-8">
					<h1 className="text-3xl font-semibold tracking-tight text-white drop-shadow">Choose Your Sport</h1>
					<p className="mt-1 text-sm text-white/90">Select a sport to create or join tournaments.</p>
				</div>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 h-[52vh]">
					{sports.map((sport) => (
						<button
							key={sport.id}
							onClick={() => setSelectedSport(sport.id)}
							className="flex flex-col items-center justify-center gap-4 rounded-xl border border-green-500 bg-green-400/90 p-8 shadow-md hover:bg-green-500/95 text-white h-full"
						>
							<span className="text-5xl">{sport.icon}</span>
							<span className="font-semibold text-white text-xl">{sport.name}</span>
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
						<button type="submit" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black" disabled={isPending}>Create Tournament</button>
						<span className="text-xs text-slate-700/90">You'll confirm in your wallet.</span>
					</div>
				</form>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{mockTournaments.map((tournament) => (
						<div key={tournament.id} className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
							<h3 className="font-semibold text-slate-900">{tournament.name}</h3>
							<p className="text-sm text-slate-600">Entry: {tournament.entryFee} ETH</p>
							<p className="text-sm text-slate-600">Prize: {tournament.prizePool} ETH</p>
							<button 
								onClick={() => joinTournament(tournament)}
								className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-black"
								disabled={isPending}
							>
								{isPending ? 'Processing...' : 'Join'}
							</button>
						</div>
					))}
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
						Entry fee: <strong>{selectedTournament.entryFee} ETH</strong>
					</p>
					<div className="flex gap-3">
						<button
							onClick={confirmJoin}
							className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
							disabled={isPending}
						>
							{isPending ? 'Processing...' : 'Yes, Join'}
						</button>
						<button
							onClick={() => {
								setShowJoinConfirm(false)
								setSelectedTournament(null)
							}}
							className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
							disabled={isPending}
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

