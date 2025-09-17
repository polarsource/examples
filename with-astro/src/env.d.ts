/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly POLAR_ACCESS_TOKEN: string
  readonly POLAR_WEBHOOK_SECRET: string
  readonly POLAR_SUCCESS_URL: string
  readonly SANDBOX_POLAR_ACCESS_TOKEN: string
  readonly SANDBOX_POLAR_WEBHOOK_SECRET: string
  readonly SANDBOX_POLAR_SUCCESS_URL: string
  readonly POLAR_MODE: 'production' | 'sandbox' | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
