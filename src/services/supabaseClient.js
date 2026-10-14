// Supabase Lightweight Client Service (Zero external dependencies)
// Uses native browser fetch with PostgREST endpoints for maximum performance and zero bundle bloat

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vmhubcbjjawiiycdhipw.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export async function fetchLiveOpportunities(limit = 300) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const endpoint = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/opportunities?select=*&status=eq.published&order=discovered_at.desc&limit=${limit}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`[Supabase Service] Failed to fetch: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch (err) {
    console.warn('[Supabase Service] Network error fetching live opportunities:', err);
    return null;
  }
}
