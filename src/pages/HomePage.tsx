import { ChevronRight, Clock, Gamepad2, Sparkles } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { createEffect, createMemo, createSignal, For, Match, Switch } from 'solid-js';
import GameCard from '#lib/components/GameCard.js';
import { gamesStore } from '#lib/stores/games.js';
import { imageErrorStore } from '#lib/stores/imageErrors.js';
import { modalStore } from '#lib/stores/modal.js';
import { windowSize } from '#lib/stores/window.js';
import type { Game } from '#lib/types/game.js';
import { getGenreClasses, getPlatformClasses } from '#lib/utils/colorConstants.js';
import { goto } from '#lib/utils/routerBridge.js';
import './HomePage.css';

const PLACEHOLDER_SRC = '/covers/placeholder_cover.webp';
const RECENT_CARD_MIN_WIDTH = 300;
const RECENT_GRID_GAP = 12;
const HOME_MAX_WIDTH = 1600;
const DESKTOP_MAIN_PADDING_X = 48;
const MOBILE_BREAKPOINT = 768;

function getRecentGridColumns(containerWidth: number, viewportWidth: number): number {
	if (viewportWidth < MOBILE_BREAKPOINT) return 2;
	const effectiveWidth =
		containerWidth > 0 ? containerWidth : Math.min(HOME_MAX_WIDTH, Math.max(0, viewportWidth - DESKTOP_MAIN_PADDING_X));
	return Math.max(1, Math.floor((effectiveWidth + RECENT_GRID_GAP) / (RECENT_CARD_MIN_WIDTH + RECENT_GRID_GAP)));
}

export default function HomePage(): JSX.Element {
	const games = createMemo(() => gamesStore.games);
	const completedGames = createMemo(() => games().filter((g) => g.status === 'Completed'));
	const playingGames = createMemo(() => games().filter((g) => g.status === 'Playing'));

	const [recentGridEl, setRecentGridEl] = createSignal<HTMLDivElement | null>(null);
	const [recentGridWidth, setRecentGridWidth] = createSignal(0);

	createEffect(
		() => recentGridEl(),
		(el) => {
			if (!el || typeof ResizeObserver === 'undefined') return;
			if (el.clientWidth > 0) setRecentGridWidth(el.clientWidth);
			const observer = new ResizeObserver((entries) => {
				const width = entries[0]?.contentRect.width;
				if (typeof width === 'number' && width > 0) {
					setRecentGridWidth(width);
				}
			});
			observer.observe(el);
			return () => observer.disconnect();
		}
	);

	const recentCompletions = createMemo(() => {
		const cols = getRecentGridColumns(recentGridWidth(), windowSize.width);
		const count = cols * 2;
		const sorted = [...completedGames()].toSorted((a, b) => {
			if (!a.finishedDate && !b.finishedDate) return 0;
			if (!a.finishedDate) return 1;
			if (!b.finishedDate) return -1;
			return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
		});
		return sorted.slice(0, count);
	});

	function coverSource(coverImage: string): string {
		if (!coverImage || imageErrorStore.hasFailed(`/${coverImage}`)) {
			return PLACEHOLDER_SRC;
		}
		return `/${coverImage}`;
	}

	function handleCoverError(event: Event): void {
		const target = event.currentTarget;
		if (!(target instanceof HTMLImageElement)) return;
		if (target.getAttribute('src')?.includes('placeholder_cover')) return;

		const failedSrc = target.currentSrc || target.src;
		if (failedSrc && !failedSrc.includes('placeholder_cover')) {
			imageErrorStore.markFailed(failedSrc);
		}
		target.src = PLACEHOLDER_SRC;
	}

	function handleRecentOpen(game: Game): void {
		modalStore.openViewModal(game, recentCompletions());
	}

	function handlePlayingOpen(game: Game): void {
		modalStore.openViewModal(game, playingGames());
	}

	function viewAllCompleted(): void {
		void goto('/completed');
	}

	return (
		<div class="homepage">
			<div class="home-content">
				<Switch
					fallback={
						<section class="now-playing-section">
							<div class="np-card-empty">
								<Gamepad2 size={32} />
								<div class="np-empty-text">
									<span class="np-empty-title">No game in progress</span>
									<span class="np-empty-sub">Mark a game as Playing to track your current session</span>
								</div>
							</div>
						</section>
					}
				>
					<Match when={playingGames().length > 0}>
						<section class="now-playing-section">
							<div class="np-header">
								<span class="np-badge">
									<Sparkles size={14} />
									Now Playing
								</span>
							</div>
							<div class="np-grid">
								<For each={playingGames()}>
									{(game, index) => (
										<button type="button" class="np-card" onClick={() => handlePlayingOpen(game)}>
											<img
												class="np-cover"
												src={coverSource(game.coverImage)}
												alt=""
												width={310}
												height={388}
												fetchpriority={index() < 2 ? 'high' : undefined}
												decoding="async"
												onError={handleCoverError}
											/>
											<div class="np-shade" aria-hidden="true" />
											<span class="np-live">
												<span class="np-live-dot" />
												Playing
											</span>
											<div class="np-overlay">
												<h2 class="np-title">{game.title}</h2>
												<div class="np-meta">
													<span class={['chip', getPlatformClasses(game.platform)]}>{game.platform}</span>
													<span class={['chip', getGenreClasses(game.genre)]}>{game.genre}</span>
													<span class="chip chip-neutral">{game.year}</span>
												</div>
												<div class="np-playtime" title="Time to Beat">
													<Clock size={14} />
													<span class="np-playtime-value">{game.playtime}</span>
												</div>
											</div>
										</button>
									)}
								</For>
							</div>
						</section>
					</Match>
					<Match when={games().length === 0}>
						<section class="now-playing-section" aria-hidden="true">
							<div class="np-header">
								<span class="np-badge">
									<Sparkles size={14} />
									Now Playing
								</span>
							</div>
							<div class="np-grid">
								<div class="np-card np-card-skeleton" />
							</div>
						</section>
					</Match>
				</Switch>

				<section class="recent-section">
					<div class="section-header">
						<div class="section-header-left">
							<h3 class="section-title">Recent Completions</h3>
							<p class="section-sub">Last {recentCompletions().length} games finished</p>
						</div>
						<button type="button" class="view-all-btn" onClick={viewAllCompleted}>
							View All
							<ChevronRight size={16} />
						</button>
					</div>
					<div class="recent-grid" ref={setRecentGridEl}>
						<For each={recentCompletions()}>
							{(game) => (
								<GameCard
									game={game}
									size="small"
									showTierBadge={true}
									onOpenModal={handleRecentOpen}
									displayedGames={recentCompletions()}
								/>
							)}
						</For>
					</div>
				</section>
			</div>
		</div>
	);
}
