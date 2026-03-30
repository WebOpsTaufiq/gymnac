import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedGymId } from '@/lib/supabase/get-verified-gym-id';
import { checkPlanLimit } from '@/lib/supabase/check-plan-limit';
import { checkGymAccess } from '@/lib/supabase/check-gym-access';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
     const supabaseAdmin = getAdminClient();
     let gymId: string;
     try { gymId = await getVerifiedGymId(); }
     catch (res) { return res as Response; }

     await checkGymAccess(gymId);

     const { data, error } = await supabaseAdmin
       .from('members')
       .select('*')
       .eq('gym_id', gymId)
       .order('created_at', { ascending: false });

     if (error) throw error;
     return NextResponse.json({ members: data });
  } catch (error: any) {
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
     const supabaseAdmin = getAdminClient();
     let gymId: string;
     try { gymId = await getVerifiedGymId(); }
     catch (res) { return res as Response; }

     const gym = await checkGymAccess(gymId);

     const body = await req.json();
     const { full_name, plan_name, plan_price, renewal_date, email, phone, status, notes } = body;

     if (!full_name || !plan_name || plan_price === undefined || !renewal_date) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
     }

     // Limit enforcement
     try {
       await checkPlanLimit(gymId, 'members', gym.plan);
     } catch (limitRes) {
       return limitRes as Response;
     }

     const { data, error } = await supabaseAdmin
       .from('members')
       .insert({
          gym_id: gymId,
          full_name,
          plan_name,
          plan_price,
          renewal_date,
          email,
          phone,
          status: status || 'active',
          notes
       })
       .select()
       .single();

     if (error) throw error;
     return NextResponse.json({ success: true, member: data });
  } catch (error: any) {
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
