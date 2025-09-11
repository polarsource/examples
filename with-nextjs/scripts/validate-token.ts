// import { Polar } from "@polar-sh/sdk";

// async function validate() {
//   const token = process.env.POLAR_ACCESS_TOKEN;
//   const env = process.env.POLAR_ENV || "sandbox";

//   if (!token) {
//     console.error("❌ POLAR_ACCESS_TOKEN is missing. Please set it in your .env file.");
//     process.exit(1);
//   }

//   const client = new Polar({
//     accessToken: token,
//     environment: env as "sandbox" | "production",
//   });

//   try {
//     // 🔴 Replace with a valid product ID from your Polar dashboard
//     const productId = process.env.POLAR_PRODUCT_ID;

//     if (!productId) {
//       console.error("❌ POLAR_PRODUCT_ID is missing. Please set it in your .env file.");
//       process.exit(1);
//     }

//     // Try to create a checkout session (but don’t redirect anywhere)
//     const session = await client.checkoutSessions.create({
//       productId,
//       // Optional: you can use a fake return URL for validation
//       successUrl: "http://localhost:3000/success",
//       cancelUrl: "http://localhost:3000/cancel",
//     });

//     if (session?.url) {
//       console.log(`✅ Polar access token is valid for ${env} mode. Checkout session created successfully.`);
//     } else {
//       console.error(`❌ Could not create checkout session in ${env} mode. Check your token & product ID.`);
//       process.exit(1);
//     }
//   } catch (err) {
//     console.error(`❌ Invalid Polar access token for ${env} mode.`);
//     console.error(err);
//     process.exit(1);
//   }
// }

// validate();
