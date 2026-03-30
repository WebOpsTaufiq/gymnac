import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getVerifiedGymId } from '@/lib/supabase/get-verified-gym-id';
import { checkPlanLimit } from '@/lib/supabase/check-plan-limit';
import { checkGymAccess } from '@/lib/supabase/check-gym-access';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
     let gymId: string;
     try { gymId = await getVerifiedGymId(); }
     catch (res) { return res as Response; }

     await checkGymAccess(gymId);

     const { data, error } = await supabaseAdmin
       .from('staff')
       .select('*')
       .eq('gym_id', gymId)
       .order('created_at', { ascending: false });

     if (error) throw error;
     return NextResponse.json(data);
  } catch (error: any) {
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
     let gymId: string;
     try { gymId = await getVerifiedGymId(); }
     catch (res) { return res as Response; }

     const gym = await checkGymAccess(gymId);

     const body = await req.json();
     const { full_name, role, email, phone } = body;

     if (!full_name || !role) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
     }

     // Limit enforcement
     try {
       await checkPlanLimit(gymId, 'staff', gym.plan);
     } catch (limitRes) {
       return limitRes as Response;
     }

     const { data, error } = await supabaseAdmin
       .from('staff')
       .insert({
          gym_id: gymId,
          full_name,
          role,
          email,
          phone
       })
       .select()
       .single();

     if (error) throw error;
     return NextResponse.json(data);
  } catch (error: any) {
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
