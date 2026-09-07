import type { ViteUserConfig } from 'vitest/config'

type Coverage = NonNullable<NonNullable<ViteUserConfig['test']>['coverage']>

/**
 * The coverage floor every Turystack package is held to.
 */
export declare const FLOOR: number

/**
 * What the floor does not apply to: a barrel, a schema, a type declaration.
 */
export declare const UNCOVERED: string[]

/**
 * The coverage block every Turystack package is held to, with `overrides`
 * merged on top.
 *
 * `exclude` is added to {@link UNCOVERED} rather than replacing it.
 */
export declare function coverage(overrides?: Partial<Coverage>): Coverage
