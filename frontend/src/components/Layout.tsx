import { Link } from 'react-router-dom'
import { WalletConnect } from './WalletConnect'

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-gray-50 text-gray-900">
			<header className="sticky top-0 z-10 border-b border-gray-200 bg-white/70 backdrop-blur">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
					<nav className="flex items-center gap-4 text-sm font-medium">
						<Link to="/" className="hover:text-blue-600">Home</Link>
						<Link to="/markets" className="hover:text-blue-600">Markets</Link>
						<Link to="/markets/create" className="hover:text-blue-600">Create</Link>
						<Link to="/teams" className="hover:text-blue-600">My Teams</Link>
					</nav>
					<WalletConnect />
				</div>
			</header>
			<main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
		</div>
	)
}
