import { Title } from '@solidjs/meta';
import type { JSX } from '@solidjs/web';
import './NotFoundPage.css';

export interface NotFoundPageProps {
	status?: number;
	message?: string;
}

export default function NotFoundPage(props: NotFoundPageProps): JSX.Element {
	const status = () => props.status ?? 404;
	const message = () => props.message || 'Not Found';

	return (
		<>
			<Title>Error {status()} | Gaming Tracker</Title>
			<div class="error-page">
				<div class="error-container">
					<div class="error-code">{status()}</div>
					<h1 class="error-title">{message()}</h1>
					<p class="error-description">
						{status() === 404
							? "The page you're looking for doesn't exist or has been moved."
							: 'An unexpected error occurred. Please try again later.'}
					</p>
					<a href="/" class="error-link">
						← Back to Home
					</a>
				</div>
			</div>
		</>
	);
}
