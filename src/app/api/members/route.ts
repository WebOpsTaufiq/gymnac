import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
     const { searchParams } = new URL(req.url);
     const gymId = searchParams.get('gymId');
     
     if (!gymId) return NextResponse.json({ error: 'Missing gymId' }, { status: 400 });

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
     const body = await req.json();
     const { gym_id, full_name, plan_name, plan_price, renewal_date, email, phone, status, notes } = body;

     if (!gym_id || !full_name || !plan_name || plan_price === undefined || !renewal_date) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
     }

     const { data, error } = await supabaseAdmin
       .from('members')
       .insert({
          gym_id,
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
