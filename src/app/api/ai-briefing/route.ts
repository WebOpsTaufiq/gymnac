import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gymId = searchParams.get('gymId');

    if (!gymId) {
      return NextResponse.json({ 
        briefing: [
          "Welcome back! Your dashboard is ready.",
          "Check the Members tab for recent status updates.",
          "Review your daily schedule for upcoming classes.",
          "Add your gymId to get a personalized AI report."
        ] 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in3Days = new Date(today);
    in3Days.setDate(today.getDate() + 3);

    const [
      { data: activeMembers },
      { count: checkinsToday },
      { count: failedPayments },
      { data: renewingSoon },
      { data: atRiskMembers }
    ] = await Promise.all([
      supabaseAdmin.from('members').select('id, plan_price').eq('gym_id', gymId).eq('status', 'active'),
      supabaseAdmin.from('checkins').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).gte('checked_in_at', today.toISOString()),
      supabaseAdmin.from('payments').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).eq('status', 'failed'),
      supabaseAdmin.from('members').select('full_name').eq('gym_id', gymId).eq('renewal_date', in3Days.toISOString().split('T')[0]),
      supabaseAdmin.from('members').select('full_name').eq('gym_id', gymId).eq('status', 'at-risk')
    ]);

    const mrr = activeMembers?.reduce((acc, m) => acc + (Number(m.plan_price) || 0), 0) || 0;
    const renewingNames = renewingSoon?.map(m => m.full_name).join(', ') || 'None';
    const atRiskNames = atRiskMembers?.map(m => m.full_name).join(', ') || 'None';

    const prompt = `Generate a concise morning briefing for a gym owner. Return exactly 4 bullet points as JSON array of strings. Data: active members: ${activeMembers?.length || 0}, MRR: ₹${mrr}, today checkins: ${checkinsToday || 0}, renewals due in 3 days: [${renewingNames}], failed payments: ${failedPayments || 0}, at-risk members: [${atRiskNames}]. Make each point actionable and specific.`;

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const json = await geminiRes.json();
    const result = JSON.parse(json.candidates[0].content.parts[0].text);
    
    // Result might be an array directly or inside an object
    let briefingArray = [];
    if (Array.isArray(result)) briefingArray = result;
    else if (result.points && Array.isArray(result.points)) briefingArray = result.points;
    else if (result.briefing && Array.isArray(result.briefing)) briefingArray = result.briefing;
    else briefingArray = Object.values(result).filter(v => typeof v === 'string');
    
    // Ensure exactly 4 points
    const finalBriefing = briefingArray.slice(0, 4).map(String);
    while (finalBriefing.length < 4) finalBriefing.push("Review additional metrics in your operations panel.");

    return NextResponse.json({ briefing: finalBriefing });

  } catch (error) {
    console.error('Briefing error:', error);
    return NextResponse.json({ 
      briefing: [
        "Welcome to your Command Center.",
        "System diagnostic running in background.",
        "Check your Analytics for 12-month trailing data.",
        "Review your Pending invoices for revenue recovery."
      ] 
    });
  }
}
