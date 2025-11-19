import { Polar } from '@polar-sh/sdk'
import { POLAR_ACCESS_TOKEN, POLAR_MODE } from 'astro:env/server'

const accessToken = POLAR_ACCESS_TOKEN
if (!accessToken) throw new Error(`Missing POLAR_ACCESS_TOKEN environment variable`)

export const polar = new Polar({ accessToken, server: POLAR_MODE as 'sandbox' | 'production' })
