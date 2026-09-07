import type { ViteUserConfig } from 'vitest/config'

type Coverage = NonNullable<NonNullable<ViteUserConfig['test']>['coverage']>

/**
 * The coverage floor every Turystack package is held to.
 */
export declare const FLOOR: number

/**
 * The coverage block every Turystack package is held to, with `overrides`
 * merged on top.
 */
export declare function coverage(overrides?: Partial<Coverage>): Coverage
