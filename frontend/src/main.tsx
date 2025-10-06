import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wallet'
import { Home } from './pages/Home'
import { CreateContest } from './pages/CreateContest'
import { MyTeams } from './pages/MyTeams'
import { Layout } from './components/Layout'
import { MarketsList } from './pages/markets/List'
import { CreateMarket } from './pages/markets/Create'
import { MarketDetail } from './pages/markets/Detail'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

const router = createBrowserRouter([
	{ path: '/', element: <Layout><Home /></Layout> },
	{ path: '/create', element: <Layout><CreateContest /></Layout> },
	{ path: '/teams', element: <Layout><MyTeams /></Layout> },
	{ path: '/markets', element: <Layout><MarketsList /></Layout> },
	{ path: '/markets/create', element: <Layout><CreateMarket /></Layout> },
	{ path: '/markets/:address', element: <Layout><MarketDetail /></Layout> },
])

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<ErrorBoundary>
					<RouterProvider router={router} />
				</ErrorBoundary>
			</QueryClientProvider>
		</WagmiProvider>
	</React.StrictMode>,
)


