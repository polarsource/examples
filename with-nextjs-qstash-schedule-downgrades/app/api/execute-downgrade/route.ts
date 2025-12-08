import { Polar } from "@polar-sh/sdk";
import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { SubscriptionProrationBehavior } from "@polar-sh/sdk/models/components/subscriptionprorationbehavior.js";

const polar = new Polar({
  server: 'sandbox',
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});

async function handler(req: NextRequest) {
  try {
    const { subscriptionId, newProductId, customerId } = await req.json();

    console.log(`Executing downgrade for subscription ${subscriptionId}`);

    // Fetch the subscription to verify it's still active
    const subscription = await polar.subscriptions.get({
      id: subscriptionId,
    });

    // Verify subscription is still active
    if (subscription.status !== "active" && subscription.status !== "trialing") {
      console.log(`Subscription ${subscriptionId} is not active, skipping downgrade`);
      return NextResponse.json({
        success: false,
        reason: "Subscription is not active",
      });
    }

    // Check if already on the target product
    if (subscription.productId === newProductId) {
      console.log(`Subscription already on product ${newProductId}`);
      return NextResponse.json({
        success: true,
        reason: "Already on target product",
      });
    }

    // Execute the downgrade
    const updatedSubscription = await polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        productId: newProductId,
        prorationBehavior: SubscriptionProrationBehavior.Invoice,
      },
    });

    console.log(`Successfully downgraded subscription ${subscriptionId}`);
    console.log(`New product: ${updatedSubscription.product.name}`);

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error("Failed to execute downgrade:", error);
    
    // Return 200 to prevent QStash retries for certain errors
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 200 }
      );
    }

    // Let QStash retry for other errors
    return NextResponse.json(
      { error: "Failed to execute downgrade" },
      { status: 500 }
    );
  }
}

// Verify QStash signature to ensure requests come from QStash
export const POST = verifySignatureAppRouter(handler);
