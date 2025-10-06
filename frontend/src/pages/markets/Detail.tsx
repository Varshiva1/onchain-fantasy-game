import { useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useReadContract, useWriteContract } from 'wagmi'
import { MarketAbi } from '../../lib/contracts'

export function MarketDetail() {
	const params = useParams()
	const address = useMemo(() => (params.address as `0x${string}`) || '0x0000000000000000000000000000000000000000', [params.address])
	const { data: question } = useReadContract({ address, abi: MarketAbi as any, functionName: 'question' })
	const { data: endTime } = useReadContract({ address, abi: MarketAbi as any, functionName: 'endTime' })
	const { data: priceYes } = useReadContract({ address, abi: MarketAbi as any, functionName: 'priceYes' })
	const { data: priceNo } = useReadContract({ address, abi: MarketAbi as any, functionName: 'priceNo' })
	const { data: resolved } = useReadContract({ address, abi: MarketAbi as any, functionName: 'resolved' })
	const { data: yesWins } = useReadContract({ address, abi: MarketAbi as any, functionName: 'yesWins' })

	const { writeContractAsync, isPending } = useWriteContract()
	const [amount, setAmount] = useState<string>('0.01')
	const [sellYesShares, setSellYesShares] = useState<string>('0')
	const [sellNoShares, setSellNoShares] = useState<string>('0')

	async function buy(side: 'yes' | 'no') {
		const valueWei = BigInt(Math.floor(parseFloat(amount || '0') * 1e18))
		await writeContractAsync({ address, abi: MarketAbi as any, functionName: side === 'yes' ? 'buyYes' : 'buyNo', value: valueWei })
	}
	async function sell(side: 'yes' | 'no') {
		const shares = BigInt(safeParseInt(side === 'yes' ? sellYesShares : sellNoShares))
		await writeContractAsync({ address, abi: MarketAbi as any, functionName: side === 'yes' ? 'sellYes' : 'sellNo', args: [shares] })
	}
	async function redeem() {
		await writeContractAsync({ address, abi: MarketAbi as any, functionName: 'redeem' })
	}

	return (
		<div style={{ padding: 16, display: 'grid', gap: 12 }}>
			<h2>{String(question || '')}</h2>
			<p>Ends: {endTime ? new Date(Number(endTime) * 1000).toLocaleString() : '...'}</p>
			<p>Yes price: {formatPrice(priceYes)} | No price: {formatPrice(priceNo)}</p>
			<div style={{ display: 'flex', gap: 8 }}>
				<input type="number" min="0" step="0.001" value={amount} onChange={(e) => setAmount(e.target.value)} />
				<button onClick={() => buy('yes')} disabled={isPending}>Buy YES</button>
				<button onClick={() => buy('no')} disabled={isPending}>Buy NO</button>
			</div>
			<div style={{ display: 'flex', gap: 8 }}>
				<input type="number" min="0" step="0.001" value={sellYesShares} onChange={(e) => setSellYesShares(e.target.value)} />
				<button onClick={() => sell('yes')} disabled={isPending}>Sell YES</button>
				<input type="number" min="0" step="0.001" value={sellNoShares} onChange={(e) => setSellNoShares(e.target.value)} />
				<button onClick={() => sell('no')} disabled={isPending}>Sell NO</button>
			</div>
			{resolved ? (
				<div>
					<p>Resolved: {String(yesWins ? 'YES' : 'NO')}</p>
					<button onClick={redeem} disabled={isPending}>Redeem</button>
				</div>
			) : (
				<p>Market not resolved yet.</p>
			)}
		</div>
	)
}

function formatPrice(v: unknown) {
	if (!v) return '...'
	try {
		const n = Number(v) / 1e18
		return n.toFixed(4)
	} catch {
		return '...'
	}
}

function safeParseInt(x: string) {
	const n = parseFloat(x)
	return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}
