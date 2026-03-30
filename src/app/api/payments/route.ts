import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedGymId } from '@/lib/supabase/get-verified-gym-id';
import { checkGymAccess } from '@/lib/supabase/check-gym-access';

export async function POST(req: NextRequest) {
  try {
    let gymId: string;
    try { gymId = await getVerifiedGymId(); }
    catch (res) { return res as Response; }

    await checkGymAccess(gymId);

    // Process a stripe payment or create a checkout session using verified gymId
    return NextResponse.json({ success: true, clientSecret: "pi_test_123" });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
