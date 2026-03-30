import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Process a stripe payment or create a checkout session
  return NextResponse.json({ success: true, clientSecret: "pi_test_123" });
}
