import env from "~/env";
import type { Route } from "./+types/webhooks";
import { Webhooks } from "@polar-sh/supabase";

export const action = async ({ request }: Route.ActionArgs) => {
    if (request.method !== "POST")
        return new Response("Method Not Allowed", { status: 405 });
    return await Webhooks({
        webhookSecret: env.POLAR_WEBHOOK_SECRET,
        onPayload: async (payload: any) => {
            console.log(payload)
        },
    })(request)
};
