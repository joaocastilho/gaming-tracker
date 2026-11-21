import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import ModalRatings from '#lib/components/detail-modal/ModalRatings.js';
import { createCompletedGame, createTestGame } from './helpers/factories';

function readSource(relativePath: string): string {
	return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
}

const CARD_SOURCE = `${readSource('../src/lib/components/game-card/GameCardInfo.tsx')}\n${readSource('../src/lib/components/game-card/GameCardInfo.css')}`;
const MODAL_SOURCE = `${readSource('../src/lib/components/detail-modal/ModalRatings.tsx')}\n${readSource('../src/lib/components/detail-modal/ModalRatings.css')}`;
const APP_CSS = readSource('../src/app.css');

describe('Detail modal score/status colours come from shared variables', () => {
	it('uses the same shared colour variable names as the game card', () => {
		expect(CARD_SOURCE).toContain('--color-status-');
		expect(MODAL_SOURCE).toContain('--color-status-');
	});

	it('does not hardcode status hex colours in either component', () => {
		const hardcodedHex = /#(?:fbbf24|34d399|60a5fa|059669|d97706|2563eb)\b/i;

		expect(CARD_SOURCE).not.toMatch(hardcodedHex);
		expect(MODAL_SOURCE).not.toMatch(hardcodedHex);
	});

	it('defines every variable both components reference', () => {
		const referenced = new Set(`${CARD_SOURCE}\n${MODAL_SOURCE}`.match(/--color-status-[a-z-]+/g) ?? []);
		expect(referenced.size).toBeGreaterThan(0);

		for (const name of referenced) {
			expect(APP_CSS, `missing definition for ${name}`).toContain(`${name}:`);
		}
	});
});

describe('Detail modal score/status badge matches the game card', () => {
	it('renders a score badge for Completed games', () => {
		const game = createCompletedGame({ score: 8 });
		const { container } = render(() => <ModalRatings game={game} />);

		const badge = container.querySelector('.score-result .score-badge');
		expect(badge).toBeTruthy();
		expect(badge?.textContent).toContain('8');
	});

	it('renders a playing badge for Playing games', () => {
		const game = createTestGame({ status: 'Playing' });
		const { container } = render(() => <ModalRatings game={game} />);

		expect(container.querySelector('.score-result .playing-badge')).toBeTruthy();
	});

	it('renders a planned badge for Planned games', () => {
		const game = createTestGame({ status: 'Planned' });
		const { container } = render(() => <ModalRatings game={game} />);

		expect(container.querySelector('.score-result .planned-badge')).toBeTruthy();
	});

	it('never renders a bare placeholder dash in the score block', () => {
		const game = createTestGame({ status: 'Planned' });
		const { container } = render(() => <ModalRatings game={game} />);

		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).not.toContain('-');
	});
});

describe('Score block has one consistent height for every status', () => {
	const statuses = [
		['Completed', createCompletedGame({ score: 8 })],
		['Playing', createTestGame({ status: 'Playing' })],
		['Planned', createTestGame({ status: 'Planned' })],
	] as const;

	it.each(statuses)('%s uses the shared status-badge box', (_name, game) => {
		const { container } = render(() => <ModalRatings game={game} />);

		const scoreResult = container.querySelector('.score-result');
		const badges = scoreResult?.querySelectorAll('.status-badge');

		expect(badges?.length).toBe(1);
		expect(badges?.[0].classList.contains('status-badge')).toBe(true);
	});

	it('declares a single fixed height for the shared badge box', () => {
		const source = MODAL_SOURCE;

		const badgeRule = source.match(/\.status-badge\s*\{([^}]*)\}/);
		expect(badgeRule).toBeTruthy();
		expect(badgeRule?.[1]).toMatch(/height:\s*[\d.]+(rem|px)/);

		expect(source).not.toMatch(/\.(score|playing|planned)-badge\s*\{[^}]*height:/);
	});

	it('gives every status the same width, not a content-sized one', () => {
		const badgeRule = MODAL_SOURCE.match(/\.status-badge\s*\{([^}]*)\}/)?.[1] ?? '';

		expect(badgeRule).toMatch(/width:\s*100%/);
		expect(MODAL_SOURCE).not.toMatch(/\.(score|playing|planned)-badge\s*\{[^}]*width:/);
	});

	it('is visibly larger than the previous compact sizing', () => {
		const badgeRule = MODAL_SOURCE.match(/\.status-badge\s*\{([^}]*)\}/)?.[1] ?? '';
		const height = Number(badgeRule.match(/height:\s*([\d.]+)rem/)?.[1]);

		expect(height).toBeGreaterThan(3);
	});

	it('keeps the badge within a compact height range', () => {
		const badgeRule = MODAL_SOURCE.match(/\.status-badge\s*\{([^}]*)\}/)?.[1] ?? '';
		const height = Number(badgeRule.match(/height:\s*([\d.]+)rem/)?.[1]);

		expect(height).toBeGreaterThanOrEqual(3.25);
		expect(height).toBeLessThanOrEqual(3.75);

		const fontSize = Number(badgeRule.match(/font-size:\s*([\d.]+)rem/)?.[1]);
		expect(fontSize).toBeLessThan(1.25);
		expect(fontSize).toBeGreaterThan(1);
	});

	it('scales the score number down on mobile portrait', () => {
		const baseSize = Number(MODAL_SOURCE.match(/\.score-num\s*\{[^}]*font-size:\s*([\d.]+)rem/)?.[1]);
		expect(baseSize).toBeGreaterThan(0);

		const portraitBlock = MODAL_SOURCE.match(
			/@media \(max-width: 767px\) and \(orientation: portrait\)\s*\{([\s\S]*?)\n\}/
		)?.[1];
		expect(portraitBlock).toBeTruthy();

		const mobileSize = Number(portraitBlock?.match(/\.score-num\s*\{[^}]*font-size:\s*([\d.]+)rem/)?.[1]);
		expect(mobileSize).toBeGreaterThan(0);
		expect(mobileSize).toBeLessThan(baseSize);
	});

	it('aligns the verdict strip with the three rating columns', () => {
		const wrapper = MODAL_SOURCE.match(/<div class="score-result[^"]*"/)?.[0] ?? '';

		expect(wrapper).not.toMatch(/\bmx-\d/);
		expect(wrapper).not.toMatch(/\bml-\d/);
		expect(wrapper).not.toMatch(/\bmr-\d/);

		const strip = MODAL_SOURCE.match(/\.verdict-strip\s*\{([^}]*)\}/)?.[1] ?? '';
		expect(strip).toMatch(/display:\s*flex/);
		expect(strip).toMatch(/flex-wrap:\s*wrap/);

		const badge = MODAL_SOURCE.match(/\.verdict-strip\s+\.status-badge\s*\{([^}]*)\}/)?.[1] ?? '';
		expect(badge).toMatch(/flex:\s*1\s+1/);

		const tier = MODAL_SOURCE.match(/\.verdict-tier\s*\{([^}]*)\}/)?.[1] ?? '';
		expect(tier).toMatch(/flex:\s*0\s+0\s+auto/);
	});

	it('renders the tier name at the same size as the tier letter', () => {
		const typography =
			MODAL_SOURCE.match(/\.verdict-letter,\s*\.verdict-name,\s*\.verdict-separator\s*\{([^}]*)\}/)?.[1] ?? '';

		expect(typography).toMatch(/font-size:\s*clamp\(/);
	});

	it('leaves the tier name in its written case', () => {
		const tier = MODAL_SOURCE.match(/\.verdict-tier\s*\{([^}]*)\}/)?.[1] ?? '';

		expect(tier).not.toMatch(/text-transform:\s*uppercase/);
	});

	it('does not render a score caption inside the badge', () => {
		expect(MODAL_SOURCE).not.toContain('score-label');
	});
});
