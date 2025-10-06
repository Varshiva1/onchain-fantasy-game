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
		<section className="-mx-6 -my-8 min-h-[78vh] px-6 py-8">
			<div className="mx-auto flex max-w-5xl items-center justify-center">
				<div className="w-full max-w-2xl rounded-2xl border border-slate-300 bg-white p-8 shadow-sm">
					<div className="mb-6">
						<h1 className="text-3xl font-semibold tracking-tight text-slate-900">Create Cricket Market</h1>
						<p className="mt-1 text-sm text-slate-800">Define the question, end time, and seed initial liquidity in ETH.</p>
					</div>
					<form onSubmit={submit} className="grid gap-5">
						<label className="grid gap-1 text-sm">
							<span className="font-medium text-slate-900">Question</span>
							<input className="rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-slate-600" value={question} onChange={(e) => setQuestion(e.target.value)} required />
						</label>
						<label className="grid gap-1 text-sm">
							<span className="font-medium text-slate-900">End time</span>
							<input type="datetime-local" className="rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-slate-600" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
						</label>
						<label className="grid gap-1 text-sm">
							<span className="font-medium text-slate-900">Initial liquidity (ETH)</span>
							<input type="number" min="0" step="0.001" className="rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-slate-600" value={liquidity} onChange={(e) => setLiquidity(e.target.value)} />
						</label>
						<div className="mt-2 flex items-center gap-3">
							<button type="submit" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black" disabled={isPending}>Create Market</button>
							<span className="text-xs text-slate-700/90">You’ll confirm in your wallet.</span>
						</div>
					</form>
				</div>
			</div>
		</section>
	)
}

