import { local } from './local.js'
import { z } from 'zod'
import { thing } from '@repo/thing'
import { resolve } from 'node:path'
import { ClockService } from '@turystack/nestjs-context'

export const used = [local, z, thing, resolve, ClockService]
