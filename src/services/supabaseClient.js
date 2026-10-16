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

/**
 * Fetch fresh buyer leads from client_outreach_proposals_pile
 */
export async function fetchBuyerLeads(limit = 100) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const endpoint = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/client_outreach_proposals_pile?select=*&order=created_at.desc&limit=${limit}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!Array.isArray(data)) return null;
    // Filter out low quality, geo-restricted, or spam buyer leads
    const cleaned = data.filter(item => {
      const combined = `${item.buyer_name || ''} ${item.title || ''} ${item.raw_text || ''}`.toLowerCase();
      if (combined.includes('ranenjshi') || combined.includes('pizzadude') || combined.includes('india only') || combined.includes('$15/month')) {
        return false;
      }
      return true;
    });
    return cleaned.length > 0 ? cleaned : null;
  } catch (e) {
    console.warn('[Supabase Service] Error fetching buyer leads:', e);
    return null;
  }
}

/**
 * Fetch high-priority Abuja and Remote corporate jobs from admin_va_jobs_pile
 */
export async function fetchCorporateJobs(limit = 100) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const endpoint = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/admin_va_jobs_pile?select=*&order=created_at.desc&limit=${limit}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch (e) {
    console.warn('[Supabase Service] Error fetching corporate jobs:', e);
    return null;
  }
}

/**
 * Updates lead status ('new', 'contacted', 'won', 'applied')
 */
export async function updateLeadStatus(tableName, link, newStatus) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !tableName || !link) return false;
  try {
    const endpoint = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/${tableName}?link=eq.${encodeURIComponent(link)}`;
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ status: newStatus })
    });
    return response.ok;
  } catch (e) {
    console.warn('[Supabase Service] Error updating lead status:', e);
    return false;
  }
}

/**
 * Saves or updates a user's Telegram alert filter preferences in Supabase
 */
export async function saveTelegramSubscriber(subscriber) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !subscriber || !subscriber.chat_id) return false;
  try {
    const endpoint = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/telegram_subscribers`;
    const payload = {
      chat_id: subscriber.chat_id,
      username: subscriber.username || '',
      first_name: subscriber.first_name || '',
      category: subscriber.category || 'all',
      location_pref: subscriber.location_pref || 'all',
      phone_number: subscriber.phone_number || '',
      is_active: true,
      updated_at: new Date().toISOString()
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(payload)
    });

    return response.ok;
  } catch (err) {
    console.warn('[Supabase Service] Failed to save Telegram subscriber:', err);
    return false;
  }
}

/**
 * Fetches an existing Telegram subscriber by chat_id
 */
export async function getTelegramSubscriber(chatId) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !chatId) return null;
  try {
    const endpoint = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/telegram_subscribers?chat_id=eq.${chatId}&select=*`;
    const response = await fetch(endpoint, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.warn('[Supabase Service] Error fetching Telegram subscriber:', err);
    return null;
  }
}


