import { transformGameData } from '../src/lib/utils/dataTransformer';

/**
 * Title Transforms and Data Normalization Tests
 *
 * Tests the dataTransformer.ts utility which handles:
 * - Title parsing (separating main title from subtitle)
 * - Date formatting (DD/MM/YYYY to ISO)
 * - UUID generation
 * - Co-op status defaults
 */

function runTests() {
	console.log('🧪 Testing Title Transforms & Data Normalization...\n');

	let passed = 0;
	let failed = 0;

	function assert(condition: boolean, message: string) {
		if (condition) {
			console.log(`✅ ${message}`);
			passed++;
		} else {
			console.log(`❌ ${message}`);
			failed++;
		}
	}

	function assertEqual(actual: unknown, expected: unknown, message: string) {
		if (actual === expected) {
			console.log(`✅ ${message}`);
			passed++;
		} else {
			console.log(`❌ ${message}`);
			console.log(`   Expected: ${expected}`);
			console.log(`   Actual:   ${actual}`);
			failed++;
		}
	}

	// Test 1: Title Parsing
	console.log('Test 1: Title Parsing');
	const gameWithSubtitle = { title: 'The Legend of Zelda: Breath of the Wild (Switch)' };
	const transformed1 = transformGameData(gameWithSubtitle);
	assertEqual(
		transformed1.mainTitle,
		'The Legend of Zelda: Breath of the Wild',
		'Extracts main title correctly'
	);
	assertEqual(transformed1.subtitle, '(Switch)', 'Extracts subtitle correctly');

	const gameSimple = { title: 'God of War' };
	const transformed2 = transformGameData(gameSimple);
	assertEqual(transformed2.mainTitle, 'God of War', 'Handles simple titles correctly');
	assertEqual(transformed2.subtitle, null, 'Sets subtitle to null for simple titles');

	// Test 2: Date Formatting
	console.log('\nTest 2: Date Formatting');
	const gameWithDate = { finishedDate: '15/01/2024' };
	const transformed3 = transformGameData(gameWithDate);
	assertEqual(
		transformed3.finishedDate,
		'2024-01-15T00:00:00.000Z',
		'Converts DD/MM/YYYY to ISO format'
	);

	const gameWithISODate = { finishedDate: '2024-02-20T00:00:00.000Z' };
	const transformed4 = transformGameData(gameWithISODate);
	assertEqual(
		transformed4.finishedDate,
		'2024-02-20T00:00:00.000Z',
		'Preserves existing ISO dates'
	);

	// Test 3: Hours Played Formatting
	console.log('\nTest 3: Hours Played Formatting');
	const gameWithDecimalHours = { hoursPlayed: 10.5 };
	const transformed5 = transformGameData(gameWithDecimalHours);
	assertEqual(transformed5.hoursPlayed, '10h 30m', 'Converts decimal hours to Xh Ym format');

	const gameWithStringHours = { hoursPlayed: '20h 15m' };
	const transformed6 = transformGameData(gameWithStringHours);
	assertEqual(transformed6.hoursPlayed, '20h 15m', 'Preserves string formatted hours');

	// Test 4: UUID Generation
	console.log('\nTest 4: UUID Generation');
	const gameNoId = { title: 'Unique Game Title' };
	const transformed7 = transformGameData(gameNoId);
	assert(!!transformed7.id, 'Generates ID if missing');

	const transformed8 = transformGameData(gameNoId);
	assertEqual(transformed7.id, transformed8.id, 'Generates deterministic ID based on title');

	const gameWithId = { id: 'existing-id', title: 'Another Game' };
	const transformed9 = transformGameData(gameWithId);
	// The utility only generates UUID if ID is missing OR invalid UUID. 'existing-id' is not a valid UUID format,
	// so it might be replaced depending on implementation. Let's check the implementation behavior.
	// Looking at code: if ((!transformed.id || !isValidUUID(String(transformed.id))) && transformed.title)
	// 'existing-id' is NOT a valid UUID, so it SHOULD be replaced.
	assert(transformed9.id !== 'existing-id', 'Replaces invalid ID with generated UUID');

	// Test 5: Co-op Defaults
	console.log('\nTest 5: Co-op Defaults');
	const gameNoCoop = { title: 'Solo Game' };
	const transformed10 = transformGameData(gameNoCoop);
	assertEqual(transformed10.coOp, 'No', 'Defaults coOp to "No"');

	const gameWithCoop = { title: 'Coop Game', coOp: 'Yes' };
	const transformed11 = transformGameData(gameWithCoop);
	assertEqual(transformed11.coOp, 'Yes', 'Preserves existing coOp value');

	console.log('\n' + '='.repeat(60));
	console.log(`📊 Summary: ${passed} Passed, ${failed} Failed`);

	if (failed > 0) {
		process.exit(1);
	}
}

runTests();
