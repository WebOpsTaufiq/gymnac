import { getAdminClient } from '@/lib/supabase/admin';

/**
 * Enforces resource quotas based on the gym's subscription plan.
 */
export async function checkPlanLimit(
  gymId: string, 
  table: 'members' | 'staff',
  plan: string
) {
  const supabaseAdmin = getAdminClient();
  const { data: planRow } = await supabaseAdmin
    .from('plans')
    .select('*')
    .eq('id', plan)
    .single();
  
  if (!planRow) return; // Fallback for undefined plans

  const { count } = await supabaseAdmin
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq('gym_id', gymId);
  
  const limit = table === 'members' 
    ? planRow.max_members 
    : planRow.max_staff;
  
  if ((count ?? 0) >= limit) {
    throw new Response(
      JSON.stringify({ error: `Plan limit reached (${limit}). Upgrade to add more ${table}.` }), 
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
