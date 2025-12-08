import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Unit tests for the mobile swipe hint feature logic.
 * These tests verify the pure logic for determining when to show the swipe hint.
 *
 * The swipe hint should appear when:
 * - Modal is open in view mode
 * - User has NOT seen the hint this session (sessionStorage not set)
 * - Viewport is mobile (width < 768px)
 * - There are multiple games to navigate between (gamesCount > 1)
 * 
 * Behavior:
 * - Uses sessionStorage (clears when tab/PWA closes)
 * - Shows once per session (first modal open only)
 * - Shows for 1.5 seconds then hides
 * - Sets sessionStorage after hiding
 */

const SWIPE_HINT_KEY = 'gaming-tracker-swipe-hint-seen';

/**
 * Helper function that determines if swipe hint should be shown.
 * This mirrors the logic in DetailModal.svelte for testability.
 */
export function shouldShowSwipeHint(options: {
    isMobile: boolean;
    gamesCount: number;
    hasSeenHint: boolean;
    isModalOpen: boolean;
    isViewMode: boolean;
}): boolean {
    const { isMobile, gamesCount, hasSeenHint, isModalOpen, isViewMode } = options;

    // Must be in view mode with modal open
    if (!isModalOpen || !isViewMode) {
        return false;
    }

    // User has already seen the hint this session
    if (hasSeenHint) {
        return false;
    }

    // Must be on mobile viewport
    if (!isMobile) {
        return false;
    }

    // Must have more than 1 game to navigate between
    if (gamesCount <= 1) {
        return false;
    }

    return true;
}

/**
 * Mock sessionStorage for testing
 */
const createMockStorage = () => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
    };
};

describe('Swipe Hint Logic', () => {
    let mockStorage: ReturnType<typeof createMockStorage>;

    beforeEach(() => {
        mockStorage = createMockStorage();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('shouldShowSwipeHint helper function', () => {
        it('returns true when all conditions are met: mobile, first time, multiple games, modal open', () => {
            const result = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: 3,
                hasSeenHint: false,
                isModalOpen: true,
                isViewMode: true
            });
            expect(result).toBe(true);
        });

        it('returns false when user has already seen the hint (sessionStorage set)', () => {
            const result = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: 3,
                hasSeenHint: true,
                isModalOpen: true,
                isViewMode: true
            });
            expect(result).toBe(false);
        });

        it('returns false on desktop viewport (width >= 768px)', () => {
            const result = shouldShowSwipeHint({
                isMobile: false,
                gamesCount: 3,
                hasSeenHint: false,
                isModalOpen: true,
                isViewMode: true
            });
            expect(result).toBe(false);
        });

        it('returns false when only 1 game is available', () => {
            const result = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: 1,
                hasSeenHint: false,
                isModalOpen: true,
                isViewMode: true
            });
            expect(result).toBe(false);
        });

        it('returns false when modal is not open', () => {
            const result = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: 3,
                hasSeenHint: false,
                isModalOpen: false,
                isViewMode: true
            });
            expect(result).toBe(false);
        });

        it('returns false when modal is in edit mode', () => {
            const result = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: 3,
                hasSeenHint: false,
                isModalOpen: true,
                isViewMode: false
            });
            expect(result).toBe(false);
        });

        it('returns false when no games are available', () => {
            const result = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: 0,
                hasSeenHint: false,
                isModalOpen: true,
                isViewMode: true
            });
            expect(result).toBe(false);
        });

        it('returns true with exactly 2 games (minimum for navigation)', () => {
            const result = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: 2,
                hasSeenHint: false,
                isModalOpen: true,
                isViewMode: true
            });
            expect(result).toBe(true);
        });
    });

    describe('sessionStorage behavior (using mock)', () => {
        it('storage starts empty (user has not seen hint)', () => {
            const hasSeenHint = mockStorage.getItem(SWIPE_HINT_KEY);
            expect(hasSeenHint).toBeNull();
        });

        it('can set storage to indicate hint was seen', () => {
            mockStorage.setItem(SWIPE_HINT_KEY, 'true');
            const hasSeenHint = mockStorage.getItem(SWIPE_HINT_KEY);
            expect(hasSeenHint).toBe('true');
        });

        it('shouldShowSwipeHint respects storage state', () => {
            // First time - should show
            const resultFirst = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: 3,
                hasSeenHint: mockStorage.getItem(SWIPE_HINT_KEY) !== null,
                isModalOpen: true,
                isViewMode: true
            });
            expect(resultFirst).toBe(true);

            // Set storage as if hint was shown
            mockStorage.setItem(SWIPE_HINT_KEY, 'true');

            // Second time - should not show
            const resultSecond = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: 3,
                hasSeenHint: mockStorage.getItem(SWIPE_HINT_KEY) !== null,
                isModalOpen: true,
                isViewMode: true
            });
            expect(resultSecond).toBe(false);
        });

        it('storage clears correctly (simulates new session)', () => {
            // Set as seen
            mockStorage.setItem(SWIPE_HINT_KEY, 'true');
            expect(mockStorage.getItem(SWIPE_HINT_KEY)).toBe('true');

            // Clear storage (simulates closing and reopening PWA)
            mockStorage.clear();
            expect(mockStorage.getItem(SWIPE_HINT_KEY)).toBeNull();

            // Should show hint again
            const result = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: 3,
                hasSeenHint: mockStorage.getItem(SWIPE_HINT_KEY) !== null,
                isModalOpen: true,
                isViewMode: true
            });
            expect(result).toBe(true);
        });
    });

    describe('Edge cases', () => {
        it('handles negative gamesCount gracefully', () => {
            const result = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: -1,
                hasSeenHint: false,
                isModalOpen: true,
                isViewMode: true
            });
            expect(result).toBe(false);
        });

        it('handles very large gamesCount', () => {
            const result = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: 10000,
                hasSeenHint: false,
                isModalOpen: true,
                isViewMode: true
            });
            expect(result).toBe(true);
        });
    });

    describe('Session-based behavior', () => {
        it('hint shows once per session, not once ever', () => {
            // Simulate first session
            const session1Storage = createMockStorage();

            // First modal open in session 1 - should show
            let result = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: 3,
                hasSeenHint: session1Storage.getItem(SWIPE_HINT_KEY) !== null,
                isModalOpen: true,
                isViewMode: true
            });
            expect(result).toBe(true);

            // Mark as seen in session 1
            session1Storage.setItem(SWIPE_HINT_KEY, 'true');

            // Second modal open in session 1 - should NOT show
            result = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: 3,
                hasSeenHint: session1Storage.getItem(SWIPE_HINT_KEY) !== null,
                isModalOpen: true,
                isViewMode: true
            });
            expect(result).toBe(false);

            // Simulate new session (fresh storage - sessionStorage clears when tab closes)
            const session2Storage = createMockStorage();

            // First modal open in session 2 - should show again
            result = shouldShowSwipeHint({
                isMobile: true,
                gamesCount: 3,
                hasSeenHint: session2Storage.getItem(SWIPE_HINT_KEY) !== null,
                isModalOpen: true,
                isViewMode: true
            });
            expect(result).toBe(true);
        });
    });
});
