// Ophancer Initial Dataset & System Configuration
// Loaded dynamically from harvested discovered opportunities
import discoveredOpportunities from './discovered_opportunities.json';

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
    bank_name: "Kuda Microfinance Bank / GTBank",
    account_number: "0123456789",
    account_name: "Ophancer Career Services",
    instruction: "Use your Full Name as transfer description/narration."
  },
  whatsapp_support: {
    phone_number: "2348012345678",
    display_phone: "+234 (0) 801 234 5678",
    default_greeting: "Hello Ophancer Team,"
  },
  telegram_channel: {
    channel_url: "https://t.me/OphancerAlerts",
    channel_name: "@OphancerAlerts"
  }
};

// Real harvested opportunities mapped with stable IDs
export const INITIAL_OPPORTUNITIES = discoveredOpportunities.map((item, idx) => ({
  ...item,
  id: item.id || item.source_identifier || `opp-${idx}`
}));

// Dynamic Category Counts based on real discovered data
export const CATEGORIES = [
  { 
    id: 'all', 
    name: 'All Categories', 
    slug: 'all', 
    count: INITIAL_OPPORTUNITIES.length 
  },
  { 
    id: 'healthcare', 
    name: 'Healthcare & Nursing', 
    slug: 'healthcare', 
    icon: 'Activity', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'healthcare').length 
  },
  { 
    id: 'finance', 
    name: 'Finance & Accounting', 
    slug: 'finance', 
    icon: 'DollarSign', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'finance').length 
  },
  { 
    id: 'education', 
    name: 'Education & Teaching', 
    slug: 'education', 
    icon: 'BookOpen', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'education').length 
  },
  { 
    id: 'logistics', 
    name: 'Logistics & Supply Chain', 
    slug: 'logistics', 
    icon: 'Truck', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'logistics').length 
  },
  { 
    id: 'hospitality', 
    name: 'Hospitality & Tourism', 
    slug: 'hospitality', 
    icon: 'Utensils', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'hospitality').length 
  },
  { 
    id: 'admin', 
    name: 'Office & Executive Admin', 
    slug: 'admin', 
    icon: 'Briefcase', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'admin' || o.category_id === 'va').length 
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
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'web-dev').length 
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
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'data').length 
  },
  { 
    id: 'content', 
    name: 'Writing & Media', 
    slug: 'content', 
    icon: 'Share2', 
    count: INITIAL_OPPORTUNITIES.filter(o => o.category_id === 'content' || o.category_id === 'media' || o.category_id === 'social').length 
  }
];
