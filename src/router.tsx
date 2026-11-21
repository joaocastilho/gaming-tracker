import { createRouter, defineRoutes } from '@solidjs/router';
import type { JSX } from '@solidjs/web';
import { lazy } from 'solid-js';
import HomePage from './pages/HomePage.js';
import Layout from './pages/Layout.js';

const StatsPage = lazy(() => import('./pages/StatsPage.js'));
const LoginPage = lazy(() => import('./pages/LoginPage.js'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.js'));

function EmptyRoute(): JSX.Element {
	return null;
}

const routes = defineRoutes([
	{
		path: '/',
		component: Layout,
		children: [
			{ path: '/', component: HomePage },
			{ path: '/library', component: EmptyRoute },
			{ path: '/completed', component: EmptyRoute },
			{ path: '/planned', component: EmptyRoute },
			{ path: '/tierlist', component: EmptyRoute },
			{ path: '/stats', component: StatsPage },
			{ path: '/login', component: LoginPage },
			{ path: '*404', component: NotFoundPage },
		],
	},
]);

export const Router = createRouter({ routes });
