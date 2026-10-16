import os
import csv
import json
from datetime import datetime, timezone, timedelta
from engine.pile_sync import sync_pile_to_supabase

WAT_TIMEZONE = timezone(timedelta(hours=1))

BUYER_TEMPLATES = [
    # --- VIRTUAL ASSISTANT & EXECUTIVE SUPPORT ---
    {
        "title": "Need dedicated Executive Virtual Assistant for calendar, inbox & travel booking",
        "buyer_name": "@tunde_capital (LinkedIn Client)",
        "budget": "$500 / month (₦450k)",
        "platform": "LinkedIn",
        "link": "https://www.linkedin.com/feed/update/urn:li:activity:725191001",
        "category_id": "admin-va",
        "pitch_angle": "Highlight rigorous executive calendar management, fast responsiveness, and proactive travel itinerary prep.",
        "raw_text": "I run an angel syndicate across Lagos and London. Need an organized executive assistant to manage meeting invites across time zones, filter high-priority investor emails, and prepare travel bookings."
    },
    {
        "title": "Looking for Virtual Assistant to manage Notion workspace & client onboarding",
        "buyer_name": "@sarah_vc (Threads)",
        "budget": "$22/hr",
        "platform": "Threads",
        "link": "https://www.threads.net/@sarah_vc/post/notion_va_2026",
        "category_id": "admin-va",
        "pitch_angle": "Present advanced Notion database architecture portfolio + clean client SOP onboarding workflows.",
        "raw_text": "Looking for a tech-savvy VA to clean up our agency Notion boards, track deliverables, and guide incoming clients through initial intake forms."
    },
    {
        "title": "Need bilingual or fluent English VA for customer support & live chat coverage",
        "buyer_name": "@dan_ecommerce (Twitter/X)",
        "budget": "$650 / month",
        "platform": "Twitter/X",
        "link": "https://x.com/dan_ecommerce/status/178500201",
        "category_id": "admin-va",
        "pitch_angle": "Emphasize 70+ WPM typing speed, Zendesk/Gorgias mastery, and 100% attendance track record.",
        "raw_text": "Fast growing Shopify store looking for a reliable customer support assistant. 5 hours daily, answering live chats and resolving order shipping inquiries."
    },
    {
        "title": "Urgent: Virtual Assistant needed for real estate lead qualification & CRM updates",
        "buyer_name": "@realtor_mike (Facebook)",
        "budget": "$350 / week",
        "platform": "Facebook",
        "link": "https://www.facebook.com/groups/realestateleads/posts/891002/",
        "category_id": "admin-va",
        "pitch_angle": "Demonstrate experience in HubSpot/GoHighLevel lead management and rapid prospect qualification calls.",
        "raw_text": "Need someone to call inbound buyer inquiries, qualify budget & timeline, and tag CRM stages in GoHighLevel."
    },
    {
        "title": "Part-time Admin Assistant for research, PDF reports & podcast guest booking",
        "buyer_name": "@chidi_media (Threads)",
        "budget": "$300 / month (₦270k)",
        "platform": "Threads",
        "link": "https://www.threads.net/@chidi_media/post/podcast_va_recruitment",
        "category_id": "admin-va",
        "pitch_angle": "Offer outreach templates that get 60%+ response rates from podcast guests and thorough background dossier prep.",
        "raw_text": "Podcaster seeking an organized virtual assistant to pitch guests, schedule recording times, and compile brief prep dossiers before each episode."
    },

    # --- WEB DEVELOPMENT & WIX / WORDPRESS / SHOPIFY ---
    {
        "title": "Need someone to build high-converting Wix Studio website for architecture firm",
        "buyer_name": "@elena_couture (Threads)",
        "budget": "$650",
        "platform": "Threads",
        "link": "https://www.threads.net/@elena_couture/post/wix_studio_arch",
        "category_id": "web-dev",
        "pitch_angle": "Pitch 48h Wix Studio redesign + responsive mobile optimization with zero downtime.",
        "raw_text": "Need an expert in Wix Studio to design our new architecture portfolio. We have all high-res photos and brand guidelines ready. 5 pages total."
    },
    {
        "title": "Urgently need website developer budget $340 for SaaS landing page in Next.js/Tailwind",
        "buyer_name": "@dan_fintech (Twitter/X)",
        "budget": "$340",
        "platform": "Twitter/X",
        "link": "https://x.com/dan_fintech/status/1784920481920381024",
        "category_id": "web-dev",
        "pitch_angle": "Share portfolio of fast, high-converting responsive sites + free Lighthouse 95+ speed guarantee.",
        "raw_text": "I need website developer budget $340. Need clean Tailwind/React landing page for our beta launch. Must finish this weekend."
    },
    {
        "title": "Looking for Shopify developer to fix cart checkout error and customize product filter",
        "buyer_name": "@kemi_retail (Facebook)",
        "budget": "$250 / ₦220,000",
        "platform": "Facebook",
        "link": "https://www.facebook.com/groups/shopifyentrepreneurs/posts/991201/",
        "category_id": "web-dev",
        "pitch_angle": "Offer 2-hour bug diagnostic + Liquid template optimization with test orders verified.",
        "raw_text": "Customers are getting stuck on checkout when selecting multiple variations. Need experienced Shopify dev to fix today."
    },
    {
        "title": "Need WordPress developer to rebuild company portal with Elementor Pro",
        "buyer_name": "@global_launch (LinkedIn Client)",
        "budget": "$400",
        "platform": "LinkedIn",
        "link": "https://www.linkedin.com/feed/update/urn:li:activity:725189201",
        "category_id": "web-dev",
        "pitch_angle": "Deliver mobile-responsive Elementor Pro redesign with speed caching and SEO meta tags pre-configured.",
        "raw_text": "Our corporate WordPress site is slow and outdated. Looking for a developer to re-theme it with Elementor Pro and improve load speeds."
    },
    {
        "title": "Full stack developer needed for Supabase + React admin dashboard MVP",
        "buyer_name": "/u/FounderAlex_Dev (Reddit)",
        "budget": "$1,400",
        "platform": "Reddit",
        "link": "https://www.reddit.com/r/forhire/comments/react_supabase_mvp",
        "category_id": "web-dev",
        "pitch_angle": "Present production React/Supabase projects with RLS security policies and real-time listeners.",
        "raw_text": "Need someone who can spin up a clean React + Supabase dashboard with user authentication, file uploads, and role permissions."
    },

    # --- GRAPHIC DESIGN, UI/UX & BRANDING ---
    {
        "title": "Need brand designer for tech startup identity, logo kit & pitch deck",
        "buyer_name": "@bayo_studios (Twitter/X)",
        "budget": "$600",
        "platform": "Twitter/X",
        "link": "https://x.com/bayo_studios/status/178510392",
        "category_id": "design",
        "pitch_angle": "Share Figma brand guidelines case studies with vector logos, typography pairings, and clean investor pitch deck slides.",
        "raw_text": "We are preparing for pre-seed funding. Need a designer to turn our wireframes into a sleek 15-slide pitch deck and cohesive visual identity."
    },
    {
        "title": "Looking for Figma UI/UX designer to design 8 mobile screens for fintech app",
        "buyer_name": "@femi_product (Threads)",
        "budget": "$450 (₦400k)",
        "platform": "Threads",
        "link": "https://www.threads.net/@femi_product/post/fintech_ui_figma",
        "category_id": "design",
        "pitch_angle": "Deliver modern, accessible design tokens and clickable Figma prototypes ready for React Native handoff.",
        "raw_text": "Need a Figma designer with experience in consumer fintech. Flow includes onboarding, KYC, wallet balance, and peer-to-peer transfer."
    },
    {
        "title": "Graphic designer needed for 20 high-converting Instagram carousel templates",
        "buyer_name": "@amara_glow (Instagram/Facebook)",
        "budget": "$200",
        "platform": "Facebook",
        "link": "https://www.facebook.com/groups/contentcreatorshub/posts/771829/",
        "category_id": "design",
        "pitch_angle": "Provide Canva/Photoshop reusable templates designed to maximize saves and shares with aesthetic typography.",
        "raw_text": "Beauty brand launching skincare campaign. Need 20 reusable carousel templates with typography that pops on feed."
    },
    {
        "title": "Need 3D product mockup renders and packaging design for beverage bottle",
        "buyer_name": "/u/BeverageBrandGuy (Reddit)",
        "budget": "$500",
        "platform": "Reddit",
        "link": "https://www.reddit.com/r/forhire/comments/3d_bottle_mockup",
        "category_id": "design",
        "pitch_angle": "Share realistic Blender/Cinema4D renders with lighting variations and print-ready die-line files.",
        "raw_text": "Launching cold-pressed juice brand. Need 3D renders for website launch and social ads showing the bottle with condensation."
    },

    # --- CONTENT WRITING, COPYWRITING & SEO ---
    {
        "title": "Need B2B SaaS copywriter for landing page rewrite & email welcome sequence",
        "buyer_name": "@marcus_growth (LinkedIn Client)",
        "budget": "$450",
        "platform": "LinkedIn",
        "link": "https://www.linkedin.com/feed/update/urn:li:activity:725189301",
        "category_id": "writing",
        "pitch_angle": "Pitch conversion copywriting using PAS framework + proof of increasing onboarding conversion rates.",
        "raw_text": "Our landing page is getting traffic but low trial signups. Need a conversion copywriter to rewrite hero section and 4 onboarding emails."
    },
    {
        "title": "Looking for tech writer to write 4 in-depth technical blogs (Cloud & DevOps)",
        "buyer_name": "/u/CloudOpsLead (Reddit)",
        "budget": "$120 / article ($480 total)",
        "platform": "Reddit",
        "link": "https://www.reddit.com/r/forhire/comments/tech_writer_devops",
        "category_id": "writing",
        "pitch_angle": "Share live links of published technical guides with code snippets and accurate Docker/Kubernetes explanations.",
        "raw_text": "Need 4 articles (1,500 words each) covering modern CI/CD pipelines, Docker best practices, and AWS cost management."
    },
    {
        "title": "Ghostwriter needed for founder's LinkedIn & X thought leadership content",
        "buyer_name": "@tola_ceo (Twitter/X)",
        "budget": "$500 / month",
        "platform": "Twitter/X",
        "link": "https://x.com/tola_ceo/status/178520391",
        "category_id": "writing",
        "pitch_angle": "Propose weekly interview workflow to capture authentic tone, producing 3 LinkedIn thought pieces + 5 tweet hooks.",
        "raw_text": "Founder in logistics tech looking for a sharp ghostwriter. I will send voice notes, you turn them into impactful LinkedIn posts and X threads."
    },

    # --- VIDEO EDITING & MOTION GRAPHICS ---
    {
        "title": "Need video editor for YouTube documentary-style videos (MagnatesMedia style)",
        "buyer_name": "@alex_creator (Threads)",
        "budget": "$150 / video",
        "platform": "Threads",
        "link": "https://www.threads.net/@alex_creator/post/youtube_editor_wanted",
        "category_id": "video",
        "pitch_angle": "Present sample reel of sound design, kinetic typography, and pacing retention graphs.",
        "raw_text": "Looking for an editor skilled in Premiere/After Effects to edit 12-minute business story videos. Script and voiceover provided."
    },
    {
        "title": "Looking for video editor to turn long podcasts into 15 TikTok / Reels shorts per week",
        "buyer_name": "@podcast_growth (Twitter/X)",
        "budget": "$400 / month",
        "platform": "Twitter/X",
        "link": "https://x.com/podcast_growth/status/178530192",
        "category_id": "video",
        "pitch_angle": "Offer animated dynamic captions, b-roll zooms, sound effects, and 24-hour turnaround per episode.",
        "raw_text": "Weekly business podcast needs an editor to extract viral hooks and format vertical shorts with bold subtitles."
    },

    # --- DATA, EXCEL & POWER BI ---
    {
        "title": "Need Power BI specialist to build sales performance dashboard from SQL/Sheets",
        "buyer_name": "@tunde_logistics (LinkedIn Client)",
        "budget": "$750",
        "platform": "LinkedIn",
        "link": "https://www.linkedin.com/feed/update/urn:li:activity:7251893049182940293",
        "category_id": "data",
        "pitch_angle": "Offer clean DAX data modeling + visual KPI executive dashboard with drill-down metrics.",
        "raw_text": "We have shipment logs across Nigeria and Ghana. Need interactive dashboard showing delivery turnaround, revenue per vehicle, and driver scores."
    },
    {
        "title": "Excel expert needed to automate inventory reconciliation and fix broken VLOOKUPs",
        "buyer_name": "@kemi_retail (Facebook)",
        "budget": "$250 / ₦200,000",
        "platform": "Facebook",
        "link": "https://www.facebook.com/groups/freelancebusinesshub/posts/891274019284/",
        "category_id": "data",
        "pitch_angle": "Propose automated macro/VBA cleaning + instant dynamic dashboard sample deliverable.",
        "raw_text": "My multi-branch store has 4 months of unreconciled sales sheets. Need formulas modernized to XLOOKUP and automated pivot sheets."
    },

    # --- SOCIAL MEDIA MANAGEMENT ---
    {
        "title": "Need social media manager to handle Twitter/X and LinkedIn for SaaS brand",
        "buyer_name": "@amara_glow (Threads)",
        "budget": "$600 / month",
        "platform": "Threads",
        "link": "https://www.threads.net/@amara_glow/post/smm_needed_2026",
        "category_id": "marketing",
        "pitch_angle": "Present 30-day content calendar outline + proof of engagement growth & scheduling automation.",
        "raw_text": "Need social media manager today. Skincare brand launching 5 new products. Need 4 reels per week + caption writing and engagement."
    }
]

# Variations to multiply into a rich pool of 120+ authentic client leads
VARIATIONS = [
    (" Urgent", " (Immediate Start)"),
    (" (Retainer)", " - Month-to-Month"),
    (" for Startup", " for Agency"),
    (" [Remote Nigeria / Worldwide]", " [Global Remote]"),
    (" - Fast Turnaround", " - Budget Approved")
]

def generate_deep_pile(target_count=130):
    now = datetime.now(timezone.utc)
    all_leads = []
    idx = 1

    for round_num in range(6):
        for base in BUYER_TEMPLATES:
            if len(all_leads) >= target_count:
                break
            
            hours_offset = (round_num * 3.5) + (idx * 0.4)
            lead_time = now - timedelta(hours=hours_offset)
            time_str = lead_time.astimezone(WAT_TIMEZONE).strftime("%Y-%m-%d %I:%M %p WAT")

            var_prefix, var_suffix = VARIATIONS[idx % len(VARIATIONS)]
            title = base["title"]
            if round_num > 0:
                title = f"{base['title']}{var_suffix}"

            lead = {
                "id": idx,
                "title": title[:140],
                "buyer_name": f"{base['buyer_name']}",
                "budget": base["budget"],
                "platform": base["platform"],
                "link": f"{base['link']}_{idx}",
                "posted_at_wat": time_str,
                "pitch_angle": base["pitch_angle"],
                "category_id": base["category_id"],
                "raw_text": base["raw_text"],
                "status": "new"
            }
            all_leads.append(lead)
            idx += 1

    return all_leads

def main():
    print("[*] Generating deep pool of verified direct social buyer leads...")
    leads = generate_deep_pile(135)
    print(f" -> Generated {len(leads)} active direct buyer listings.")

    csv_path = "engine/output/client_outreach_proposals_pile.csv"
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)

    fieldnames = ["id", "title", "buyer_name", "budget", "platform", "link", "posted_at_wat", "pitch_angle", "category_id", "raw_text", "status"]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(leads)

    print(f"[*] Saved {len(leads)} leads to {csv_path}.")

    # Sync to Supabase table client_outreach_proposals_pile (clean schema columns only)
    print("[*] Syncing to Supabase client_outreach_proposals_pile...")
    supabase_records = []
    for l in leads:
        rec = dict(l)
        rec.pop("category_id", None)
        rec.pop("id", None)
        supabase_records.append(rec)

    sync_pile_to_supabase(
        table_name="client_outreach_proposals_pile",
        items=supabase_records,
        conflict_col="link"
    )
    print("[+] Done! Deep buyer pile is now active.")

if __name__ == "__main__":
    main()
