import { Polar } from '@polar-sh/sdk';
import { CustomerPortal } from "@polar-sh/supabase";
import env from "~/env";
import type { Route } from './+types/portal';

export async function loader({ request }: Route.LoaderArgs) {
    const polar = new Polar({ accessToken: env.POLAR_ACCESS_TOKEN, server: env.POLAR_MODE })
    return await CustomerPortal({
        server: env.POLAR_MODE,
        accessToken: env.POLAR_ACCESS_TOKEN,
        getCustomerId: async (request: Request) => {
            const email = new URL(request.url).searchParams.get('email')
            const customer = await polar.customers.list({ email })
            return customer.result.items[0].id
        },
    })(request);
}
