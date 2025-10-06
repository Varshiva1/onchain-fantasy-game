import { NavLink } from 'react-router-dom'
import { WalletConnect } from './WalletConnect'

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen">
			<header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-100/95 backdrop-blur">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="h-9 w-9 rounded-lg bg-slate-300" />
						<span className="text-lg font-semibold text-slate-900">Onchain Fantasy</span>
					</div>
					<nav className="flex items-center gap-2 text-sm">
						<NavLink to="/" className={({isActive}) => `rounded-full px-4 py-2 ${isActive ? 'bg-white text-slate-900 ring-1 ring-slate-300' : 'text-slate-700 hover:bg-white hover:ring-1 hover:ring-slate-300'}`}>Home</NavLink>
						<NavLink to="/markets" className={({isActive}) => `rounded-full px-4 py-2 ${isActive ? 'bg-white text-slate-900 ring-1 ring-slate-300' : 'text-slate-700 hover:bg-white hover:ring-1 hover:ring-slate-300'}`}>Markets</NavLink>
						<NavLink to="/markets/create" className={({isActive}) => `rounded-full px-4 py-2 ${isActive ? 'bg-white text-slate-900 ring-1 ring-slate-300' : 'text-slate-700 hover:bg-white hover:ring-1 hover:ring-slate-300'}`}>Create</NavLink>
						<NavLink to="/teams" className={({isActive}) => `rounded-full px-4 py-2 ${isActive ? 'bg-white text-slate-900 ring-1 ring-slate-300' : 'text-slate-700 hover:bg-white hover:ring-1 hover:ring-slate-300'}`}>My Teams</NavLink>
					</nav>
					<WalletConnect />
				</div>
			</header>
			<main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
		</div>
	)
}
