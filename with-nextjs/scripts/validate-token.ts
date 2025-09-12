import { Polar } from "@polar-sh/sdk";

async function validateAccessToken() {
  const accessToken = process.env.NEXT_PUBLIC_POLAR_ACCESS_TOKEN;

  if (!accessToken) {
    console.error("❌ Missing POLAR_ACCESS_TOKEN in environment variables.");
    process.exit(1);
  }

  try {
    const client = new Polar({
      accessToken,
      server:"sandbox",
    });

    // Simple test: try listing products (requires valid accessToken)
    const products = await client.products.list({ limit: 1 });

    if (products?.result.items.length >= 0) {
      console.log(`✅ Polar access token is valid in`);
    }
  } catch (err: any) {
    console.error("❌ Polar access token validation failed:", err.message || err);
    process.exit(1);
  }
}

validateAccessToken();
