import env from '$lib/env'
import { Webhooks } from "@polar-sh/sveltekit";

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  onPayload: async (payload) => {
    console.log(payload)
  },
});
