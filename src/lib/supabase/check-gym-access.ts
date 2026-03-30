import { getAdminClient } from '@/lib/supabase/admin';

/**
 * Verifies gym status and expiration.
 * Redirects or throws if the gym is not in active standing.
 */
export async function checkGymAccess(gymId: string) {
  const supabaseAdmin = getAdminClient();
  const { data: gym, error } = await supabaseAdmin
    .from('gyms')
    .select('*')
    .eq('id', gymId)
    .single();

  if (error || !gym) {
    throw new Error('Gym not found');
  }

  // Check if expired
  if (gym.expires_at && new Date(gym.expires_at) < new Date() && gym.status === 'active') {
    await supabaseAdmin.from('gyms').update({ status: 'expired' }).eq('id', gymId);
    gym.status = 'expired';
  }

  if (gym.status !== 'active') {
    let message = 'Access Denied';
    if (gym.status === 'pending') {
      message = 'Your account is pending approval. The owner will activate it shortly after payment confirmation.';
    } else if (gym.status === 'suspended') {
      message = 'Your account has been suspended. Contact support.';
    } else if (gym.status === 'expired') {
      message = 'Your subscription has expired. Please renew to continue.';
    }

    const res = new Response(JSON.stringify({ error: message, status: gym.status }), { 
      status: 402,
      headers: { 'Content-Type': 'application/json' }
    });
    throw res;
  }

  return gym;
}
