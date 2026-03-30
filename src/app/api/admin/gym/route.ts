import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function PATCH(req: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();
    const supabase = await (await import('@/lib/supabase/server')).createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== process.env.NEXT_PUBLIC_OWNER_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { gymId, action, plan, months } = await req.json();

    if (!gymId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const now = new Date();
    let expiresAt = new Date();
    if (months) {
      expiresAt.setMonth(now.getMonth() + Number(months));
    }

    if (action === 'approve') {
      const { error } = await supabaseAdmin
        .from('gyms')
        .update({
          status: 'active',
          plan: plan || 'starter',
          approved_at: now.toISOString(),
          expires_at: expiresAt.toISOString()
        })
        .eq('id', gymId);
      
      if (error) throw error;
    } else if (action === 'suspend') {
      const { error } = await supabaseAdmin
        .from('gyms')
        .update({ status: 'suspended' })
        .eq('id', gymId);
      
      if (error) throw error;
    } else if (action === 'reactivate') {
       const { error } = await supabaseAdmin
         .from('gyms')
         .update({ 
           status: 'active',
           expires_at: expiresAt.toISOString() 
         })
         .eq('id', gymId);
       
       if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
