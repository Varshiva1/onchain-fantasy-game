import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function WalletConnect() {
	const { isConnected, address } = useAccount()
	const { connectors, connect, isPending } = useConnect()
	const { disconnect } = useDisconnect()

	if (!isConnected) {
		return (
			<div style={{ display: 'flex', gap: 8 }}>
				{connectors.map((c) => (
					<button key={c.uid} onClick={() => connect({ connector: c })} disabled={isPending}>
						Connect {c.name}
					</button>
				))}
			</div>
		)
	}

	return (
		<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
			<span style={{ fontFamily: 'monospace' }}>{address?.slice(0, 6)}…{address?.slice(-4)}</span>
			<button onClick={() => disconnect()}>Disconnect</button>
		</div>
	)
}
