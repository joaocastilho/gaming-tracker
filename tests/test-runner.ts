#!/usr/bin/env bun
import './setup.ts'; // Ensure mocks are loaded first

/**
 * Test Runner for Gaming Tracker Application
 *
 * This script runs all tests in the tests directory with consistent logging
 * and provides a unified test report.
 */

interface TestResult {
	name: string;
	description: string;
	status: 'PASS' | 'FAIL' | 'SKIP';
	duration: number;
	error?: string;
}

interface TestSuite {
	name: string;
	description: string;
	tests: TestResult[];
	summary: {
		total: number;
		passed: number;
		failed: number;
		skipped: number;
		successRate: number;
		totalDuration: number;
	};
}

class TestRunner {
	private suites: TestSuite[] = [];
	private startTime: number = 0;

	constructor() {
		this.startTime = performance.now();
	}

	async runAllTests(): Promise<void> {
		console.log('🧪 Gaming Tracker Test Suite');
		console.log('='.repeat(60));
		console.log('');

		// Test 1: Completed Games Caching
		await this.runTestSuite(
			'Completed Games Caching',
			'Tests the caching optimization for completed games sorting',
			async () => {
				const { runTests } = await import('./test-completed-games-caching.js');
				// runTests() returns void, so we assume success if no error was thrown
				runTests();
				return true;
			}
		);

		// Test 2: Data Persistence
		await this.runTestSuite(
			'Data Persistence',
			'Tests localStorage and URL parameter persistence',
			async () => {
				const { runDataPersistenceTests } = await import('./test-data-persistence.js');
				const results = await runDataPersistenceTests();
				return results.summary.failed === 0;
			}
		);

		// Test 3: Theme Switching
		await this.runTestSuite(
			'Theme Switching',
			'Tests dark/light theme functionality and persistence',
			async () => {
				const { runThemeSwitchingTests } = await import('./test-theme-switching.js');
				const results = await runThemeSwitchingTests();
				return results.summary.failed === 0;
			}
		);

		// Test 4: Browser Navigation
		await this.runTestSuite(
			'Browser Navigation',
			'Tests URL state preservation and navigation functionality',
			async () => {
				const { runBrowserNavigationTests } = await import('./test-browser-navigation.js');
				const results = await runBrowserNavigationTests();
				return results.summary.failed === 0;
			}
		);

		// Test 5: User Flows
		await this.runTestSuite(
			'User Flows',
			'Tests end-to-end user workflows and interactions',
			async () => {
				const { runUserFlowTests } = await import('./test-user-flows.js');
				// User flow tests return void, so we assume success if no error was thrown
				await runUserFlowTests();
				return true;
			}
		);

		// Test 6: Title Transforms (Unit Tests)
		await this.runTestSuite('Title Transforms', 'Tests data transformation utilities', async () => {
			return this.runExternalTest(['bun', 'tests/test-title-transforms.ts']);
		});

		// Test 7: Sorting and Filtering (Integration Tests)
		await this.runTestSuite(
			'Sorting and Filtering',
			'Tests filtering and sorting logic with mocked stores',
			async () => {
				return this.runExternalTest([
					'bun',
					'test',
					'tests/test-sorting-filtering.test.ts',
					'--preload',
					'./tests/setup.ts'
				]);
			}
		);

		// Test 8: Loading Speeds (Benchmarks)
		await this.runTestSuite(
			'Loading Speeds',
			'Benchmarks performance of critical operations',
			async () => {
				return this.runExternalTest(['bun', 'tests/test-loading-speeds.ts']);
			}
		);

		// Test 9: Detail Modal Navigation (Unit Tests)
		await this.runTestSuite(
			'Detail Modal Navigation',
			'Tests modal state and deep linking',
			async () => {
				return this.runExternalTest([
					'bun',
					'test',
					'tests/test-detail-modal-navigation.test.ts',
					'--preload',
					'./tests/setup.ts'
				]);
			}
		);

		// Test 10: Utility Tests
		await this.runTestSuite('Utility Tests', 'Tests core utility functions', async () => {
			return this.runExternalTest([
				'bun',
				'test',
				'tests/test-utils.test.ts',
				'--preload',
				'./tests/setup.ts'
			]);
		});

		// Test 11: Cover Loading (Visual/Network)
		await this.runTestSuite(
			'Cover Loading',
			'Tests image loading behavior and optimization',
			async () => {
				return this.runExternalTest(['bun', 'tests/test-cover-loading.ts']);
			}
		);

		this.printFinalReport();
	}

	private async runTestSuite(
		name: string,
		description: string,
		testFn: () => Promise<boolean>
	): Promise<void> {
		console.log(`📋 Running: ${name}`);
		console.log(`   ${description}`);

		const startTime = performance.now();
		let status: 'PASS' | 'FAIL' | 'SKIP' = 'PASS';
		let error: string | undefined;

		try {
			const result = await testFn();
			if (!result) {
				status = 'FAIL';
				error = 'Test suite returned false';
			}
		} catch (e) {
			status = 'FAIL';
			error = e instanceof Error ? e.message : String(e);
		}

		const endTime = performance.now();
		const duration = endTime - startTime;

		console.log(`   ${status === 'PASS' ? '✅' : '❌'} ${status} (${duration.toFixed(2)}ms)`);

		if (error && status === 'FAIL') {
			console.log(`   Error: ${error}`);
		}

		// Create a simple test result for this suite
		const testResult: TestResult = {
			name,
			description,
			status,
			duration,
			error
		};

		// Add to suites (we'll treat each suite as a single test for simplicity)
		const suite: TestSuite = {
			name,
			description,
			tests: [testResult],
			summary: {
				total: 1,
				passed: testResult.status === 'PASS' ? 1 : 0,
				failed: testResult.status === 'FAIL' ? 1 : 0,
				skipped: testResult.status === 'SKIP' ? 1 : 0,
				successRate: testResult.status === 'PASS' ? 100 : 0,
				totalDuration: duration
			}
		};

		this.suites.push(suite);
		console.log('');
	}

	private async runExternalTest(command: string[]): Promise<boolean> {
		try {
			const proc = Bun.spawn(command, {
				stdout: 'inherit',
				stderr: 'inherit'
			});
			const exitCode = await proc.exited;
			return exitCode === 0;
		} catch (e) {
			console.error('Failed to run external test:', e);
			return false;
		}
	}

	private printFinalReport(): void {
		const endTime = performance.now();
		const totalDuration = endTime - this.startTime;

		console.log('');
		console.log('🎯 Final Test Results');
		console.log('='.repeat(60));

		// Calculate overall statistics
		const totalTests = this.suites.reduce((sum, suite) => sum + suite.summary.total, 0);
		const totalPassed = this.suites.reduce((sum, suite) => sum + suite.summary.passed, 0);
		const totalFailed = this.suites.reduce((sum, suite) => sum + suite.summary.failed, 0);
		const totalSkipped = this.suites.reduce((sum, suite) => sum + suite.summary.skipped, 0);
		const overallSuccessRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

		console.log('');
		console.log('📊 Overall Summary:');
		console.log(`   Total Test Suites: ${this.suites.length}`);
		console.log(`   Total Tests: ${totalTests}`);
		console.log(`   ✅ Passed: ${totalPassed}`);
		console.log(`   ❌ Failed: ${totalFailed}`);
		console.log(`   ⏭️  Skipped: ${totalSkipped}`);
		console.log(`   Success Rate: ${overallSuccessRate.toFixed(1)}%`);
		console.log(`   Total Duration: ${totalDuration.toFixed(2)}ms`);

		console.log('');
		console.log('📋 Detailed Results:');

		this.suites.forEach((suite) => {
			const test = suite.tests[0]; // Each suite has one test
			const statusIcon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⏭️';
			console.log(`   ${statusIcon} ${suite.name}: ${test.status} (${test.duration.toFixed(2)}ms)`);

			if (test.error && test.status === 'FAIL') {
				console.log(`      Error: ${test.error}`);
			}
		});

		console.log('');
		console.log('='.repeat(60));

		if (totalFailed > 0) {
			console.log('❌ Some tests failed. Please review the errors above.');
			process.exit(1);
		} else {
			console.log('🎉 All tests passed! The application is ready for use.');
		}
	}
}

// Add package.json script support
if (import.meta.main) {
	const runner = new TestRunner();
	runner.runAllTests().catch((error) => {
		console.error('Test runner failed:', error);
		process.exit(1);
	});
}

export { TestRunner };
