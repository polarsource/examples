import env from "$lib/env";
import { Polar } from '@polar-sh/sdk'
import { CustomerPortal } from "@polar-sh/sveltekit";
import type { RequestEvent } from "@sveltejs/kit";

const polar = new Polar({ accessToken: env.POLAR_ACCESS_TOKEN, server: env.POLAR_MODE })

export const GET = CustomerPortal({
    server: env.POLAR_MODE,
    accessToken: env.POLAR_ACCESS_TOKEN,
    getCustomerId: async (event: RequestEvent) => {
        const email = new URL(event.request.url).searchParams.get('email')
        const customer = await polar.customers.list({ email })
        return customer.result.items[0].id
      },
});
