import type { JSX } from '@solidjs/web';
import { Errored } from 'solid-js';
import { Router } from './router';
import './app.css';

function formatErrorMessage(err: unknown): string {
	if (err instanceof Error && err.message) return err.message;
	if (typeof err === 'string' && err) return err;
	return 'An unexpected error occurred.';
}

export default function App(): JSX.Element {
	return (
		<Errored
			fallback={(err, reset) => (
				<main
					role="alert"
					style={{
						'min-height': '100vh',
						display: 'flex',
						'align-items': 'center',
						'justify-content': 'center',
						padding: '1.5rem',
						background: 'var(--color-background)',
						color: 'var(--color-text-primary)',
					}}
				>
					<div
						style={{
							'max-width': '28rem',
							width: '100%',
							padding: '1.5rem',
							'border-radius': '0.75rem',
							background: 'var(--color-surface)',
							border: '1px solid var(--color-border)',
							'text-align': 'center',
						}}
					>
						<h1 style={{ 'font-size': '1.25rem', 'font-weight': '600', margin: '0 0 0.5rem' }}>Something went wrong</h1>
						<p
							style={{
								color: 'var(--color-text-secondary)',
								'font-size': '0.875rem',
								margin: '0 0 1.25rem',
							}}
						>
							{formatErrorMessage(err)}
						</p>
						<button
							type="button"
							onClick={reset}
							style={{
								padding: '0.5rem 1.25rem',
								'border-radius': '0.5rem',
								background: 'var(--color-accent)',
								color: '#ffffff',
								border: 'none',
								'font-weight': '600',
								cursor: 'pointer',
							}}
						>
							Try Again
						</button>
					</div>
				</main>
			)}
		>
			<Router />
		</Errored>
	);
}
