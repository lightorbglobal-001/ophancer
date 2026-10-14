// Supabase Lightweight Client Service (Zero external dependencies)
// Uses native browser fetch with PostgREST endpoints for maximum performance and zero bundle bloat

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vmhubcbjjawiiycdhipw.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaHViY2JqamF3aWl5Y2RoaXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5ODI5OTYsImV4cCI6MjEwNzU1ODk5Nn0.bmXPJJUKkQQXLCIauZnq5j-akRrNtixTjh1ElR0QI_w';

/**
 * Fetch live published opportunities from Supabase PostgreSQL
 */
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

/**
 * Instantly pushes a newly submitted opportunity to Supabase PostgreSQL database
 */
export async function pushOpportunityToSupabase(opp) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !opp) {
    return false;
  }

  try {
    const endpoint = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/opportunities`;
    const record = {
      source_identifier: opp.source_identifier || `sub-${Date.now()}`,
      title: opp.title || 'Untitled Role',
      slug: opp.slug || opp.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) || 'job',
      company_name: opp.company_name || 'Direct Employer',
      category_id: opp.category_id || 'web-dev',
      category_name: opp.category_name || 'General Tech',
      opportunity_type: opp.opportunity_type || 'service_request',
      work_mode: opp.work_mode || 'remote',
      location: opp.location || 'Nigeria & Remote',
      currency: opp.currency || (opp.location?.toLowerCase().includes('nigeria') ? 'NGN' : 'USD'),
      min_budget: opp.min_budget || null,
      max_budget: opp.max_budget || null,
      budget_raw_text: opp.budget_raw_text || 'Competitive / Negotiable',
      is_budget_negotiable: opp.is_budget_negotiable ?? true,
      source_name: opp.source_name || 'Community Direct Post',
      source_url: opp.source_url || '',
      description: opp.description || '',
      tags: Array.isArray(opp.tags) ? opp.tags : [],
      status: 'published',
      discovered_at: opp.discovered_at || new Date().toISOString(),
      expires_at: opp.expires_at || new Date(Date.now() + 14 * 86400000).toISOString()
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(record)
    });

    if (!response.ok) {
      console.warn(`[Supabase Service] Push error: ${response.status}`, await response.text());
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[Supabase Service] Failed to push opportunity to cloud:', err);
    return false;
  }
}
