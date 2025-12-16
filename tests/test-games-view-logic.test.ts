
import { describe, it, expect } from 'vitest';

describe('GamesView Key Logic Reproduction', () => {
    it('reproduces duplicate key undefined with defective logic', () => {
        const columns = 4;
        const rowGamesLength = 1; // 1 game in the row
        const emptySlots = columns - rowGamesLength; // 3 empty slots

        // Simulation of: {#each Array.from({ length: ... }) as i (i)}
        // Array.from({ length: 3 }) produces [undefined, undefined, undefined]
        // "as i" assigns existing item (undefined) to "i"
        // key "(i)" uses that value.

        const items = Array.from({ length: emptySlots });
        const keys = items.map(i => i); // Key is the item itself

        // Verify we get undefined keys
        expect(keys.length).toBe(3);
        expect(keys[0]).toBeUndefined();
        expect(keys[1]).toBeUndefined();
        expect(keys[2]).toBeUndefined();

        // Check for duplicates
        const uniqueKeys = new Set(keys);
        expect(uniqueKeys.size).toBe(1); // Only 1 unique value: undefined
        // This confirms "Keyed each block has duplicate key undefined"
    });

    it('generates unique keys with corrected logic', () => {
        const columns = 4;
        const rowGamesLength = 1;
        const emptySlots = columns - rowGamesLength;

        // Simulation of: {#each Array.from({ length: ... }) as _, i (i)}
        // We use the index "i" as the key.

        const items = Array.from({ length: emptySlots });
        const keys = items.map((_, i) => i); // Key is the index

        expect(keys).toEqual([0, 1, 2]);

        // Check for duplicates
        const uniqueKeys = new Set(keys);
        expect(uniqueKeys.size).toBe(3); // 3 unique keys
    });
});
