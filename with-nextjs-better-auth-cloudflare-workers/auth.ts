import { polar, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from 'drizzle-orm/postgres-js';

if (!process.env.POLAR_ACCESS_TOKEN)
    throw new Error('POLAR_ACCESS_TOKEN is not set');

if (!process.env.POLAR_WEBHOOK_SECRET)
    throw new Error('POLAR_WEBHOOK_SECRET is not set');

if (!process.env.DATABASE_URL)
    throw new Error('DATABASE_URL is not set');

const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    server: process.env.POLAR_MODE === 'production' ? 'production' : 'sandbox'
});

const db = drizzle(process.env.DATABASE_URL);

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                webhooks({
                    secret: process.env.POLAR_WEBHOOK_SECRET,
                    onOrderRefunded: (payload) => {
                        console.log(payload);
                        return Promise.resolve();
                    }
                })
            ],
        })
    ],
})