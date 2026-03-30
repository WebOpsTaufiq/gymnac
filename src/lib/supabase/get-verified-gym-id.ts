import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * Reads the session from the request cookies, looks up the user's gym_id
 * in the profiles table, and returns it.
 * Throws a Response with status 401 or 403 if anything fails.
 * Use this at the top of every API route instead of trusting the client.
 */
export async function getVerifiedGymId(): Promise<string> {
  const supabase = await createClient();
  const supabaseAdmin = getAdminClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('gym_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.gym_id) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  return profile.gym_id;
}
