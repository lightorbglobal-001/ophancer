import discoveredOpportunities from './discovered_opportunities.json';
import directBuyerGigs from './direct_buyer_gigs.json';

export const INITIAL_SETTINGS = {
  cv_pricing: {
    ngn_single: 5000,
    ngn_double: 8000,
    usd_single: 5,
    usd_double: 8,
    currency_symbol_ngn: "₦",
    currency_symbol_usd: "$",
  },
  bank_details: {
    bank_name: "Kuda Microfinance Bank",
    account_number: "3002678880",
    account_name: "Lightorb Innovations",
    instruction: "Use your Full Name as transfer description/narration."
  },
  whatsapp_support: {
    phone_number: "2348025100844",
    display_phone: "+234 802 510 0844",
    default_greeting: "Hello Ophancer Team,"
  },
  telegram_channel: {
    channel_url: "https://t.me/OphancerAlerts",
    channel_name: "@OphancerAlerts"
  }
};

// Combined rich dataset: Verified corporate vacancies + Direct social buyer client gigs (310 total)
export const INITIAL_OPPORTUNITIES = [
  ...discoveredOpportunities.map((item, idx) => ({
    ...item,
    id: item.id || item.source_identifier || `opp-${idx}`,
    opportunity_type: item.opportunity_type || 'job_vacancy'
  })),
  ...directBuyerGigs.map((item, idx) => ({
    ...item,
    id: item.id || `social-buyer-${idx + 1}`,
    opportunity_type: 'service_request'
  }))
];

// Dynamic Category Counts based on real discovered data
export const CATEGORIES = [
  { 
    id: 'all', 
    name: 'All Categories', 
    slug: 'all', 
    count: INITIAL_OPPORTUNITIES.length 
  },
  { 
    id: 'ngo', 
    name: 'NGO & Development', 
    slug: 'ngo', 
    icon: 'HeartHandshake', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'ngo' || o.category_id === 'development').length 
  },
  { 
    id: 'finance', 
    name: 'Banking & Finance', 
    slug: 'finance', 
    icon: 'DollarSign', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'finance' || o.category_id === 'banking').length 
  },
  { 
    id: 'energy', 
    name: 'Oil, Gas & Energy', 
    slug: 'energy', 
    icon: 'Flame', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'energy' || o.category_id === 'oil-gas' || o.category_id === 'engineering').length 
  },
  { 
    id: 'healthcare', 
    name: 'Healthcare & Medical', 
    slug: 'healthcare', 
    icon: 'Activity', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'healthcare' || o.category_id === 'medical').length 
  },
  { 
    id: 'education', 
    name: 'Education & Teaching', 
    slug: 'education', 
    icon: 'BookOpen', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'education' || o.category_id === 'teaching').length 
  },
  { 
    id: 'admin', 
    name: 'Office & Executive Admin', 
    slug: 'admin', 
    icon: 'Briefcase', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'admin' || o.category_id === 'admin-va' || o.category_id === 'va').length 
  },
  { 
    id: 'logistics', 
    name: 'Logistics & Supply Chain', 
    slug: 'logistics', 
    icon: 'Truck', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'logistics' || o.category_id === 'supply-chain').length 
  },
  { 
    id: 'hospitality', 
    name: 'Hospitality & Tourism', 
    slug: 'hospitality', 
    icon: 'Utensils', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'hospitality').length 
  },
  { 
    id: 'sales-retail', 
    name: 'Sales & Retail', 
    slug: 'sales-retail', 
    icon: 'ShoppingBag', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'sales-retail' || o.category_id === 'sales').length 
  },
  { 
    id: 'support', 
    name: 'Customer Care & Support', 
    slug: 'support', 
    icon: 'LifeBuoy', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'support').length 
  },
  { 
    id: 'web-dev', 
    name: 'Web & Software Dev', 
    slug: 'web-dev', 
    icon: 'Code', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'web-dev' || o.category_id === 'software').length 
  },
  { 
    id: 'design', 
    name: 'Graphic & UI/UX Design', 
    slug: 'design', 
    icon: 'Palette', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'design' || o.category_id === 'graphic-design').length 
  },
  { 
    id: 'data', 
    name: 'Data Analysis & Sheets', 
    slug: 'data', 
    icon: 'BarChart3', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'data' || o.category_id === 'data-analysis').length 
  },
  { 
    id: 'content', 
    name: 'Writing & Media', 
    slug: 'content', 
    icon: 'Share2', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'content' || o.category_id === 'media' || o.category_id === 'social' || o.category_id === 'video').length 
  }
];
