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
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Cricket Markets</h2>
				<Link to="/markets/create" className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">Create Market</Link>
			</div>
			{!isConnected && <p className="text-sm text-gray-500">Connect a wallet to create and trade.</p>}
			<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{markets.map((m) => (
					<li key={m} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
						<Link to={`/markets/${m}`} className="text-blue-600 hover:underline break-all">{m}</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
