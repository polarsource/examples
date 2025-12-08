import { Checkout } from "@polar-sh/supabase";
import env from "~/env";
import type { Route } from "./+types/checkout";

export async function loader({ request }: Route.LoaderArgs) {
    return await Checkout({
        includeCheckoutId: true,
        server: env.POLAR_MODE,
        successUrl: env.POLAR_SUCCESS_URL,
        accessToken: env.POLAR_ACCESS_TOKEN,
    })(request);
}
