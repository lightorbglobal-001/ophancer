-- ==============================================================================
-- Ophancer Opportunity Database Schema (Supabase / PostgreSQL)
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Create Opportunities Table
CREATE TABLE IF NOT EXISTS public.opportunities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    source_identifier TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    company_name TEXT NOT NULL,
    category_id TEXT NOT NULL DEFAULT 'web-dev',
    category_name TEXT NOT NULL DEFAULT 'Tech & Digital',
    opportunity_type TEXT NOT NULL DEFAULT 'job_vacancy', -- 'job_vacancy' or 'service_request'
    work_mode TEXT NOT NULL DEFAULT 'remote',             -- 'remote', 'hybrid', or 'onsite'
    location TEXT NOT NULL DEFAULT 'Nigeria / Remote',
    currency TEXT NOT NULL DEFAULT 'NGN',                 -- 'NGN' or 'USD'
    min_budget NUMERIC,
    max_budget NUMERIC,
    budget_raw_text TEXT DEFAULT 'Negotiable',
    is_budget_negotiable BOOLEAN DEFAULT true,
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    description TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'published',             -- 'published', 'draft', 'archived'
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Search Indexes for Ultra-Fast Queries
CREATE INDEX IF NOT EXISTS idx_opportunities_source_id ON public.opportunities (source_identifier);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities (category_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON public.opportunities (opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_location ON public.opportunities (location);
CREATE INDEX IF NOT EXISTS idx_opportunities_currency ON public.opportunities (currency);
CREATE INDEX IF NOT EXISTS idx_opportunities_discovered_at ON public.opportunities (discovered_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- 4. Public Read Policy (Anyone can read published opportunities)
DROP POLICY IF EXISTS "Public Read Access" ON public.opportunities;
CREATE POLICY "Public Read Access" ON public.opportunities
    FOR SELECT
    USING (status = 'published');

-- 5. Service Role Insert/Update Policy (Aggregator engine can upsert opportunities)
DROP POLICY IF EXISTS "Service Role Upsert Access" ON public.opportunities;
CREATE POLICY "Service Role Upsert Access" ON public.opportunities
    FOR ALL
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE public.opportunities IS 'Harvested job vacancies and freelance service requests indexed by Ophancer Discovery Radar.';
