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
 * The coverage block every Turystack package is held to.
 *
 * `overrides` is merged on top, which is how a frontend excludes its generated
 * route tree without restating the provider, the reporters or the thresholds.
 */
export function coverage(overrides = {}) {
	return {
		provider: 'v8',
		reporter: ['text', 'json-summary', 'json'],
		thresholds: {
			branches: FLOOR,
			functions: FLOOR,
			lines: FLOOR,
			statements: FLOOR,
		},
		...overrides,
	}
}
