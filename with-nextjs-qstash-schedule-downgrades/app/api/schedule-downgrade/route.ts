import { Polar } from "@polar-sh/sdk";
import { Client } from "@upstash/qstash";
import { NextRequest, NextResponse } from "next/server";

const polar = new Polar({
  server: 'sandbox',
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});

const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, newProductId } = await req.json();

    // Step 1: Fetch current subscription details
    const subscription = await polar.subscriptions.get({
      id: subscriptionId,
    });

    if (!subscription.currentPeriodEnd) {
      return NextResponse.json(
        { error: "Subscription has no current period end date" },
        { status: 400 }
      );
    }

    // Step 2: Calculate when to execute the downgrade
    const executeAt = new Date(subscription.currentPeriodEnd);

    // Step 3: Schedule the downgrade with QStash
    const result = await qstash.publishJSON({
      retries: 1,
      body: {
        subscriptionId,
        newProductId,
        customerId: subscription.customerId,
      },
      url: `${process.env.APP_URL}/api/execute-downgrade`,
      delay: Math.floor((executeAt.getTime() - (new Date()).getTime()) / 1000),
    });

    // Step 4: Optionally store the scheduled task
    // You might want to store this in your database
    console.log(`Scheduled downgrade for subscription ${subscriptionId}`);
    console.log(`Will execute at: ${executeAt.toISOString()}`);
    console.log(`QStash message ID: ${result.messageId}`);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      scheduledFor: executeAt.toISOString(),
    });
  } catch (error) {
    console.error("Failed to schedule downgrade:", error);
    return NextResponse.json(
      { error: "Failed to schedule downgrade" },
      { status: 500 }
    );
  }
}