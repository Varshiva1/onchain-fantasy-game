import { Link } from 'react-router-dom'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { FACTORY_ADDRESS, FactoryAbi } from '../../lib/contracts'
import { useEffect, useState } from 'react'

export function MarketsList() {
	const { isConnected } = useAccount()
	const [markets, setMarkets] = useState<string[]>([])

	useEffect(() => {
		// Could hydrate from an indexer; this demo builds from events while mounted.
	}, [])

	useWatchContractEvent({
		address: FACTORY_ADDRESS,
		abi: FactoryAbi as any,
		eventName: 'MarketCreated',
		onLogs(logs) {
			for (const log of logs) {
				// @ts-ignore
				const m = log.args.market as string
				setMarkets((prev) => (prev.includes(m) ? prev : [m, ...prev]))
			}
		},
	})

	return (
		<div style={{ padding: 16 }}>
			<h2>Cricket Markets</h2>
			{!isConnected && <p>Connect a wallet to create and trade.</p>}
			<Link to="/markets/create">Create Market</Link>
			<ul>
				{markets.map((m) => (
					<li key={m}>
						<Link to={`/markets/${m}`}>{m}</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
