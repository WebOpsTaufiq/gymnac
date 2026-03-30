import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { getVerifiedGymId } from '@/lib/supabase/get-verified-gym-id';
import { checkGymAccess } from '@/lib/supabase/check-gym-access';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
     let gymId: string;
     try { gymId = await getVerifiedGymId(); }
     catch (res) { return res as Response; }

     await checkGymAccess(gymId);

     const body = await req.json();
     const { member_id } = body;

     if (!member_id) {
        return NextResponse.json({ success: false, message: 'Missing member_id' }, { status: 400 });
     }

     const today = new Date();
     today.setHours(0,0,0,0);
     const tomorrow = new Date(today);
     tomorrow.setDate(tomorrow.getDate() + 1);

     // Check Duplicate
     const { data: existing } = await supabaseAdmin
       .from('checkins')
       .select('id')
       .eq('member_id', member_id)
       .gte('checked_in_at', today.toISOString())
       .lt('checked_in_at', tomorrow.toISOString())
       .limit(1);

     if (existing && existing.length > 0) {
        return NextResponse.json({ success: false, message: 'Already checked in today' });
     }

     // Insert
     const { data: checkin, error } = await supabaseAdmin
       .from('checkins')
       .insert({
          gym_id: gymId,
          member_id,
          checked_in_at: new Date().toISOString()
       })
       .select('*, members(full_name, plan_name)')
       .single();

     if (error) throw error;

     return NextResponse.json({ success: true, checkin });
  } catch (error: any) {
     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
