import { test, expect } from '@playwright/test';

const viewports = [
	{ name: 'desktop-hd', width: 1920, height: 1080 },
	{ name: 'desktop', width: 1366, height: 768 },
	{ name: 'tablet', width: 768, height: 1024 },
	{ name: 'mobile', width: 375, height: 667 },
	{ name: 'small-mobile', width: 320, height: 568 },
];

test.describe('Game Card Responsive Layout', () => {
	for (const viewport of viewports) {
		test(`card info elements should be visible at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
			page,
		}) => {
			await page.setViewportSize({ width: viewport.width, height: viewport.height });
			await page.goto('http://localhost:5173');
			await page.waitForLoadState('networkidle');

			const gameCards = page.locator('.game-card');
			const cardCount = await gameCards.count();

			expect(cardCount).toBeGreaterThan(0);

			for (let i = 0; i < Math.min(cardCount, 3); i++) {
				const card = gameCards.nth(i);
				const timeDateRow = card.locator('.time-date-row');
				const ratingsCompact = card.locator('.ratings-compact');
				const statusIndicator = card.locator('.status-indicator');

				await expect(timeDateRow).toBeVisible();
				await expect(ratingsCompact).toBeVisible();
				await expect(statusIndicator).toBeVisible();

				const timeDateBox = await timeDateRow.boundingBox();
				const ratingsBox = await ratingsCompact.boundingBox();
				const statusBox = await statusIndicator.boundingBox();

				expect(timeDateBox).not.toBeNull();
				expect(ratingsBox).not.toBeNull();
				expect(statusBox).not.toBeNull();

				if (timeDateBox && ratingsBox && statusBox) {
					expect(ratingsBox.height).toBeGreaterThan(20);
					expect(statusBox.height).toBeGreaterThan(10);
				}
			}
		});
	}
});
