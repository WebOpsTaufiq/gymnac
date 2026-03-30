import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getVerifiedGymId } from '@/lib/supabase/get-verified-gym-id';

// Initialize a Supabase client with the Service Role Key to bypass RLS and access the Admin API
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // If this is called during signup, there might not be a gymId yet.
    // However, the user requested getVerifiedGymId for every file in /src/app/api/**
    let gymId: string;
    try { gymId = await getVerifiedGymId(); }
    catch (res) { return res as Response; }

    const { userId } = await req.json();
    
    // Force confirm the user via the admin API
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
