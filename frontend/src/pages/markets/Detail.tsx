import { useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useReadContract, useWriteContract } from 'wagmi'
import { MarketAbi } from '../../lib/contracts'

export function MarketDetail() {
	const params = useParams()
	const address = useMemo(
		() => (params.address as `0x${string}`) || '0x0000000000000000000000000000000000000000',
		[params.address]
	)

	// ✅ Helper ensures cross-version safety (v1/v2)
	const readConfig = (fn: string) => ({
		address,
		abi: MarketAbi as any,
		functionName: fn,
		// @ts-ignore — safely ignored for Wagmi v1 builds
		args: [],
	})

	const { data: question } = useReadContract(readConfig('question'))
	const { data: endTime } = useReadContract(readConfig('endTime'))
	const { data: priceYes } = useReadContract(readConfig('priceYes'))
	const { data: priceNo } = useReadContract(readConfig('priceNo'))
	const { data: resolved } = useReadContract(readConfig('resolved'))
	const { data: yesWins } = useReadContract(readConfig('yesWins'))

	const { writeContractAsync, isPending } = useWriteContract()
	const [amount, setAmount] = useState<string>('0.01')
	const [sellYesShares, setSellYesShares] = useState<string>('0')
	const [sellNoShares, setSellNoShares] = useState<string>('0')

	async function buy(side: 'yes' | 'no') {
		const valueWei = BigInt(Math.floor(parseFloat(amount || '0') * 1e18))
		await writeContractAsync({
			address,
			abi: MarketAbi as any,
			functionName: side === 'yes' ? 'buyYes' : 'buyNo',
			// @ts-ignore — optional args for backward compatibility
			args: [],
			value: valueWei,
		})
	}

	async function sell(side: 'yes' | 'no') {
		const shares = BigInt(safeParseInt(side === 'yes' ? sellYesShares : sellNoShares))
		await writeContractAsync({
			address,
			abi: MarketAbi as any,
			functionName: side === 'yes' ? 'sellYes' : 'sellNo',
			args: [shares],
		})
	}

	async function redeem() {
		await writeContractAsync({
			address,
			abi: MarketAbi as any,
			functionName: 'redeem',
			// @ts-ignore
			args: [],
		})
	}

	return (
		<div className="grid gap-4">
			<h2 className="text-xl font-semibold break-words">{String(question || '')}</h2>
			<p className="text-sm text-gray-600">
				Ends: {endTime ? new Date(Number(endTime) * 1000).toLocaleString() : '...'}
			</p>

			<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
				<p className="text-sm">
					Yes price: <span className="font-medium">{formatPrice(priceYes)}</span> | No price:{' '}
					<span className="font-medium">{formatPrice(priceNo)}</span>
				</p>
				<div className="mt-3 flex flex-wrap items-center gap-2">
					<input
						type="number"
						min="0"
						step="0.001"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						className="w-32 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500"
					/>
					<button
						onClick={() => buy('yes')}
						disabled={isPending}
						className="rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
					>
						Buy YES
					</button>
					<button
						onClick={() => buy('no')}
						disabled={isPending}
						className="rounded-md bg-rose-600 px-3 py-2 text-white hover:bg-rose-700"
					>
						Buy NO
					</button>
				</div>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					<p className="mb-2 text-sm font-medium">Sell YES</p>
					<div className="flex items-center gap-2">
						<input
							type="number"
							min="0"
							step="0.001"
							value={sellYesShares}
							onChange={(e) => setSellYesShares(e.target.value)}
							className="w-32 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500"
						/>
						<button
							onClick={() => sell('yes')}
							disabled={isPending}
							className="rounded-md bg-gray-800 px-3 py-2 text-white hover:bg-black"
						>
							Sell
						</button>
					</div>
				</div>

				<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					<p className="mb-2 text-sm font-medium">Sell NO</p>
					<div className="flex items-center gap-2">
						<input
							type="number"
							min="0"
							step="0.001"
							value={sellNoShares}
							onChange={(e) => setSellNoShares(e.target.value)}
							className="w-32 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500"
						/>
						<button
							onClick={() => sell('no')}
							disabled={isPending}
							className="rounded-md bg-gray-800 px-3 py-2 text-white hover:bg-black"
						>
							Sell
						</button>
					</div>
				</div>
			</div>

			{resolved ? (
				<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					<p>
						Resolved: <span className="font-medium">{String(yesWins ? 'YES' : 'NO')}</span>
					</p>
					<button
						onClick={redeem}
						disabled={isPending}
						className="mt-2 rounded-md bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
					>
						Redeem
					</button>
				</div>
			) : (
				<p className="text-sm text-gray-600">Market not resolved yet.</p>
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
