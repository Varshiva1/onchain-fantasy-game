import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { FACTORY_ADDRESS, FactoryAbi } from '../../lib/contracts'

export function CreateMarket() {
	const { isConnected } = useAccount()
	const { writeContractAsync, isPending } = useWriteContract()
	const [question, setQuestion] = useState('India to hit 10+ sixes today?')
	const [endTime, setEndTime] = useState<string>('')
	const [liquidity, setLiquidity] = useState<string>('0.01')

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

	return (
		<div style={{ padding: 16 }}>
			<h2>Create Cricket Market</h2>
			<form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
				<label>
					<span>Question</span>
					<input value={question} onChange={(e) => setQuestion(e.target.value)} required />
				</label>
				<label>
					<span>End time</span>
					<input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
				</label>
				<label>
					<span>Initial liquidity (ETH)</span>
					<input type="number" min="0" step="0.001" value={liquidity} onChange={(e) => setLiquidity(e.target.value)} />
				</label>
				<button type="submit" disabled={isPending}>Create</button>
			</form>
		</div>
	)
}
