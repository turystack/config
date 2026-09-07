import { resolve } from 'node:path'

import { z } from 'zod'

import { ClockService } from '@turystack/nestjs-context'

import { thing } from '@repo/thing'

import { local } from './local.js'

export const used = [
  local,
  z,
  thing,
  resolve,
  ClockService,
]
