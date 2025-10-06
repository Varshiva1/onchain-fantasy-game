import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useEffect, useRef, useState } from 'react'

export function WalletConnect() {
	const { isConnected, address } = useAccount()
	const { connectors, connect, isPending } = useConnect()
	const { disconnect } = useDisconnect()
	const [open, setOpen] = useState(false)
	const pop = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		function onDoc(e: MouseEvent) {
			if (!pop.current) return
			if (!pop.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('click', onDoc)
		return () => document.removeEventListener('click', onDoc)
	}, [])

	if (!isConnected) {
		return (
			<div className="relative" ref={pop}>
				<button onClick={() => setOpen((v) => !v)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">
					Connect
				</button>
				{open && (
					<div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-slate-200 bg-white text-slate-900 shadow-lg">
						<ul className="divide-y divide-slate-200">
							{connectors.map((c) => (
								<li key={c.uid}>
									<button
										className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
										onClick={() => {
											connect({ connector: c })
											setOpen(false)
										}}
										disabled={isPending}
									>
										{c.name}
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		)
	}

	return (
		<div className="flex items-center gap-2">
			<span className="font-mono text-sm text-slate-700">{address?.slice(0, 6)}…{address?.slice(-4)}</span>
			<button onClick={() => disconnect()} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">Disconnect</button>
		</div>
	)
}

