/**
 * The parts of a test configuration that do not depend on where the code runs.
 *
 * A backend and a frontend disagree about the environment, the plugins and the
 * files that are worth covering. They do not disagree about the floor, and when
 * the number lived in two files it was one edit away from meaning two different
 * things.
 */

export const FLOOR = 85

/**
 * What the floor does not apply to.
 *
 * A barrel re-exports, a schema declares and a type declares: there is no
 * branch in them to cover, and requiring a test for one produces a test that
 * asserts an import worked.
 */
export const UNCOVERED = [
	'**/*.d.ts',
	'**/*.mock.ts',
	'**/*.schema.ts',
	'**/*.types.ts',
	'**/index.ts',
]

/**
 * The coverage block every Turystack package is held to.
 *
 * `overrides` is merged on top, which is how a frontend excludes its generated
 * route tree without restating the provider, the reporters or the thresholds.
 */
export function coverage({ exclude = [], include, ...overrides } = {}) {
	return {
		// Naming the sources is what puts a file with no test in the report at
		// all. Without it Vitest measures only what a test imported, so the file
		// nobody tested is not at 0% — it is absent, and the average of what
		// remains looks healthy.
		include: include ?? ['src/**/*.{ts,tsx}'],
		exclude: [...UNCOVERED, ...exclude],
		provider: 'v8',
		reporter: ['text', 'json-summary', 'json'],
		thresholds: {
			branches: FLOOR,
			functions: FLOOR,
			lines: FLOOR,
			// Per file, not across the project. A repository at 100% and an
			// operation at nothing average to a number that passes, and the
			// operation is the half that decides.
			perFile: true,
			statements: FLOOR,
		},
		...overrides,
	}
}
