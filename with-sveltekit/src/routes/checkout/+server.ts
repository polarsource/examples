import env from '$lib/env';
import { Checkout } from "@polar-sh/sveltekit";

export const GET = Checkout({
    server: env.POLAR_MODE,
    successUrl: env.POLAR_SUCCESS_URL,
    accessToken: env.POLAR_ACCESS_TOKEN,
});
