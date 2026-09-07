#!/usr/bin/env node

/**
 * The gate on the baseline.
 *
 * This package publishes decisions rather than code, and the way a decision
 * stops applying is silent: Biome does not report a configuration it could not
 * reach through `extends`, it formats with its own defaults instead. So the
 * fixture is a consumer — a project that resolves this package by the same
 * specifier a real one writes — and the assertions are what such a consumer
 * would notice going missing.
 *
 * The consumer is built in a temporary directory rather than inside this
 * repository. A fixture that sits under `config/biome.json` inherits it as a
 * parent configuration, and then passes whether `extends` worked or not: the
 * first version of this script proved nothing for exactly that reason.
 */

import { execFileSync } from 'node:child_process'
import {
	cpSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import process from 'node:process'

const ROOT = resolve(import.meta.dirname, '..')
const FIXTURES = resolve(ROOT, 'fixtures')
const configuredBiome = process.env.BIOME ?? 'biome'
const BIOME = configuredBiome.includes('/') ? resolve(ROOT, configuredBiome) : configuredBiome

const problems = []

/** A consumer project, outside this repository, with this package installed. */
function consumer(config) {
	const directory = mkdtempSync(resolve(tmpdir(), 'turystack-config-'))
	const scope = resolve(directory, 'node_modules/@turystack')

	mkdirSync(scope, { recursive: true })
	symlinkSync(ROOT, resolve(scope, 'config'), 'dir')

	for (const [name, contents] of Object.entries(config)) {
		writeFileSync(resolve(directory, name), contents, 'utf8')
	}

	return directory
}

function biome(directory, args) {
	try {
		return execFileSync(BIOME, args, { cwd: directory, encoding: 'utf8' })
	} catch (error) {
		const output = `${error.stdout ?? ''}${error.stderr ?? ''}`

		if (output.trim() === '') {
			throw new Error(`could not run '${BIOME}': ${error.message}`)
		}

		return output
	}
}

// 1. A consumer that extends this package gets the formatter, the rules and the
//    import order it promises.
const direct = consumer({
	'biome.json': `${JSON.stringify({ extends: ['@turystack/config/biome'] }, null, '\t')}\n`,
})

cpSync(resolve(FIXTURES, 'input'), resolve(direct, 'src'), { recursive: true })
biome(direct, ['check', '--write', 'src'])

for (const file of readdirSync(resolve(FIXTURES, 'expected'))) {
	const produced = readFileSync(resolve(direct, 'src', file), 'utf8')
	const promised = readFileSync(resolve(FIXTURES, 'expected', file), 'utf8')

	if (produced !== promised) {
		problems.push(`${file}: the consumer did not get the shape this package promises`)
		process.stdout.write(`\n--- ${file}, as the consumer sees it ---\n${produced}`)
	}
}

// One lint rule that is this package's own choice rather than a Biome default,
// so a baseline that arrived empty fails here too and not only on formatting.
if (!/lint\/style\/useBlockStatements/.test(biome(direct, ['lint', 'src/block-statements.ts']))) {
	problems.push('block-statements.ts: useBlockStatements did not reach the consumer')
}

// 2. The limitation the two kind packages are built around: Biome does not
//    follow a nested `extends`. A configuration reached through `extends` may
//    declare one of its own, and Biome applies none of it — no diagnostic, no
//    exit code, the consumer simply formatted by Biome's own defaults.
//
//    `@turystack/backend-config` and `@turystack/frontend-config` therefore
//    restate the blocks they share with this package, and each compares them in
//    its own build. If the assertion below ever fails, Biome has started
//    following the chain and that restating can go away.
const chained = consumer({
	'middle.json': `${JSON.stringify({ extends: ['@turystack/config/biome'] }, null, '\t')}\n`,
	'biome.json': `${JSON.stringify({ extends: ['./middle.json'] }, null, '\t')}\n`,
})

mkdirSync(resolve(chained, 'src'))
writeFileSync(resolve(chained, 'src/chained.ts'), 'export const a = { b: 1 };\n', 'utf8')
biome(chained, ['format', '--write', 'src'])

if (readFileSync(resolve(chained, 'src/chained.ts'), 'utf8') !== 'export const a = { b: 1 };\n') {
	problems.push(
		'a nested `extends` now applies — Biome has been fixed, and the kind packages can extend this one instead of restating it',
	)
}

rmSync(direct, { force: true, recursive: true })
rmSync(chained, { force: true, recursive: true })

if (problems.length > 0) {
	process.stdout.write(`\n✖ ${problems.length} problem(s) with the published baseline:\n`)
	for (const problem of problems) {
		process.stdout.write(`  ${problem}\n`)
	}
	process.stdout.write('\n')
	process.exitCode = 1
} else {
	process.stdout.write(
		'\n✓ a consumer extending @turystack/config/biome gets the formatter, the rules and the import order; a nested extends still applies nothing\n\n',
	)
}
