/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly POLAR_OAT: string
  readonly POLAR_WEBHOOK_SECRET: string
  readonly POLAR_SUCCESS_URL: string
  readonly POLAR_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
