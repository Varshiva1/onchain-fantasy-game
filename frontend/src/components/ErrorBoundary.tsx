import React from 'react'

type State = { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
	state: State = { hasError: false }

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error) {
		console.error('ErrorBoundary caught', error)
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{ padding: 16 }}>
					<h2>Something went wrong.</h2>
					<pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error?.message || this.state.error)}</pre>
				</div>
			)
		}
		return this.props.children
	}
}
