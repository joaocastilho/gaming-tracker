import type { JSX } from '@solidjs/web';
import { HydrationScript } from '@solidjs/web';

interface DocumentProps {
	children?: JSX.Element;
}

const THEME_INIT_SCRIPT = `if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
	const savedTheme = localStorage.getItem("gaming-tracker-theme");
	if (savedTheme === "light" || savedTheme === "dark") {
		document.documentElement.classList.add(savedTheme);
	} else {
		document.documentElement.classList.add("dark");
	}
}`;

export default function Document(props: DocumentProps): JSX.Element {
	return (
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
				<title>Gaming Tracker</title>
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-title" content="Gaming Tracker" />
				<meta
					name="description"
					content="My personal video game collection with ratings, tier lists, and progress tracking."
				/>
				<link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin="" />
				<link rel="preload" href="/fonts/inter-600.woff2" as="font" type="font/woff2" crossorigin="" />
				<link rel="preload" href="/fonts/inter-700.woff2" as="font" type="font/woff2" crossorigin="" />
				<link rel="preload" href="/games.json" as="fetch" crossorigin="" />

				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
				<link rel="manifest" href="/site.webmanifest" />

				<script innerHTML={THEME_INIT_SCRIPT} />
				<HydrationScript />
			</head>
			<body class="bg-background min-h-screen">
				<noscript>
					<div style={{ padding: '2rem', 'text-align': 'center', 'font-family': 'system-ui, sans-serif' }}>
						<h1>Gaming Tracker</h1>
						<p>This application requires JavaScript to run. Please enable JavaScript in your browser settings.</p>
					</div>
				</noscript>
				<div class="contents">{props.children}</div>
			</body>
		</html>
	);
}
