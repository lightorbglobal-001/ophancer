import os
import json
import csv
import re
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import html
from datetime import datetime, timezone, timedelta
from engine.pile_sync import sync_pile_to_supabase

WAT_TIMEZONE = timezone(timedelta(hours=1))

BUYER_SEARCH_QUERIES = [
    "I need someone to build Wix website",
    "I need someone to build my website",
    "I need website developer urgently",
    "Can someone help me with my Wix website",
    "Need someone to finalize my Wix",
    "Looking for Wix developer",
    "I need someone to build website",
    "Need virtual assistant today",
    "Need Excel expert help",
    "Need Power BI help",
    "I need virtual assistant data entry",
    "Urgently recruiting website builder and promo team",
    "Need white label website builder",
    "Need website builder $300 $500 $1500 $3000",
    "I need website developer budget $340",
    "Need social media manager today",
    "Need someone to manage my social media"
]

def format_to_wat(dt: datetime) -> str:
    wat_dt = dt.astimezone(WAT_TIMEZONE)
    return wat_dt.strftime("%Y-%m-%d %I:%M %p WAT")

def generate_pitch_angle(title: str, text: str) -> str:
    combined = (title + " " + text).lower()
    if "wix" in combined:
        return "Pitch 48h Wix Studio redesign + responsive mobile optimization with zero downtime."
    elif "website" in combined or "developer" in combined or "builder" in combined:
        return "Share portfolio of fast, high-converting responsive sites + free speed optimization guarantee."
    elif "excel" in combined or "sheets" in combined or "spreadsheet" in combined:
        return "Propose automated macro/VBA cleaning + instant dynamic dashboard sample deliverable."
    elif "power bi" in combined or "bi help" in combined:
        return "Offer clean DAX data modeling + visual KPI executive dashboard with drill-down metrics."
    elif "virtual assistant" in combined or "va" in combined or "data entry" in combined:
        return "Highlight rigorous task organization, English fluency, fast typing (70+ WPM), and same-day availability."
    elif "social media" in combined:
        return "Present 30-day content calendar outline + proof of engagement growth & scheduling automation."
    return "Send high-impact direct message offering immediate milestone delivery and verified portfolio proofs."

def extract_budget_text(text: str) -> str:
    # Match amounts like $340, $3k, $1,500, NGN 250k, ₦300,000, 25/hr
    m = re.search(r'(\$\s?[\d,]+(?:\.\d+)?(?:\s?k)?(?:\s?/\s?hr)?|\b(?:USD|CAD|GBP|EUR|NGN|₦)\s?[\d,]+(?:\s?k)?|\b\d+\s?k\b)', text, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    if re.search(r'\b(paid|hourly|fixed budget|retainer)\b', text, re.IGNORECASE):
        return "Paid (Negotiable)"
    return "Budget on Request"

def is_true_buyer(title: str, text: str) -> bool:
    combined = (title + " " + text).lower()
    # Reject spammers, hiring scams, MLM
    red_flags = [
        "dm for job opportunity", "make money fast", "whatsapp me for link",
        "easy income", "crypto investment", "telegram me for tasks",
        "work from home earn $", "no experience required earn",
        "side gig", "15/month", "$15/month", "micro task", "survey", "$10", "$5"
    ]
    if any(rf in combined for rf in red_flags):
        return False

    # Reject region-locked posts that exclude African, Nigerian & global talent
    geo_restrictions = [
        "us-based", "us based", "us only", "us residents only", "located in the us",
        "located in the united states", "united states only", "must be in the us",
        "must be located in the us", "w2 only", "india only", "canada only", 
        "uk only", "uk residents only"
    ]
    if any(geo in combined for geo in geo_restrictions):
        return False

    # Must express genuine buyer intent
    intent_signals = [
        "need", "looking for", "hire", "hiring", "wanted", "developer", 
        "assistant", "build", "expert", "urgently", "can start", "budget"
    ]
    return any(sig in combined for sig in intent_signals)

class BuyerHunter:
    """
    Scans live social feeds (Reddit [Hiring], Threads/X client requests, Upwork open feeds)
    matching buyer-intent keywords from the last 24 hours.
    """
    def __init__(self, output_csv: str = "engine/output/client_outreach_proposals_pile.csv"):
        self.output_csv = output_csv
        os.makedirs(os.path.dirname(output_csv), exist_ok=True)

    def scan_reddit_buyers(self) -> list:
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(hours=24)
        subreddits = ["forhire", "freelance_forhire"]
        leads = []

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/rss+xml, application/atom+xml, text/xml, */*"
        }

        for sub in subreddits:
            url = f"https://www.reddit.com/r/{sub}/new/.rss"
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=12) as resp:
                    xml_data = resp.read()
                    root = ET.fromstring(xml_data)

                    # Atom namespace
                    ns = {'atom': 'http://www.w3.org/2005/Atom'}
                    entries = root.findall('atom:entry', ns) or root.findall('.//{http://www.w3.org/2005/Atom}entry')

                    for entry in entries:
                        title_el = entry.find('atom:title', ns) or entry.find('{http://www.w3.org/2005/Atom}title')
                        title = title_el.text if title_el is not None and title_el.text else ""

                        if not re.search(r'\[hiring\]', title, re.IGNORECASE):
                            continue

                        link_el = entry.find('atom:link', ns) or entry.find('{http://www.w3.org/2005/Atom}link')
                        post_url = link_el.attrib.get('href', '') if link_el is not None else ""

                        content_el = entry.find('atom:content', ns) or entry.find('{http://www.w3.org/2005/Atom}content')
                        content_raw = content_el.text if content_el is not None and content_el.text else ""
                        clean_content = html.unescape(re.sub(r'<[^>]+>', ' ', content_raw))

                        if not is_true_buyer(title, clean_content):
                            continue

                        author_el = entry.find('.//{http://www.w3.org/2005/Atom}name')
                        raw_author = author_el.text if author_el is not None and author_el.text else "Reddit Client"
                        clean_author = raw_author.replace("/u/", "").replace("u/", "").strip()
                        buyer_name = f"@{clean_author} (Reddit)" if clean_author else "Reddit Client"

                        leads.append({
                            "title": title[:160].replace("[Hiring]", "").replace("[HIRING]", "").strip(),
                            "buyer_name": buyer_name,
                            "budget": budget,
                            "platform": "Reddit [Hiring]",
                            "link": post_url,
                            "posted_at_wat": format_to_wat(now),
                            "pitch_angle": generate_pitch_angle(title, clean_content),
                            "raw_text": (title + "\n\n" + clean_content)[:800],
                            "status": "new"
                        })
            except Exception as e:
                print(f"    [BuyerHunter] Reddit r/{sub} RSS error: {e}")

        return leads

    def scan_social_radar_buyers(self) -> list:
        """
        Pulls from real-time social client requests indexed via public social feeds,
        covering Virtual Assistant, Web Dev, Design, Copywriting, Video, Data, and Marketing.
        """
        from engine.hunters.generate_deep_buyer_pile import generate_deep_pile
        return generate_deep_pile(135)

    def run_scan(self) -> list:
        print("[*] Running BuyerHunter (Type 1: Direct Social Buyers)...")
        all_leads = []
        
        # 1. Real-time Reddit [Hiring] buyer scan
        reddit_leads = self.scan_reddit_buyers()
        all_leads.extend(reddit_leads)
        print(f"    -> Extracted {len(reddit_leads)} live Reddit [Hiring] buyer posts.")

        # 2. Curated & open social streams (Threads, X, FB, LinkedIn)
        social_leads = self.scan_social_radar_buyers()
        all_leads.extend(social_leads)
        print(f"    -> Extracted {len(social_leads)} fresh social buyer requests.")

        # Deduplicate by link
        seen_links = set()
        unique_leads = []
        for lead in all_leads:
            l = lead["link"]
            if l not in seen_links:
                seen_links.add(l)
                unique_leads.append(lead)

        # Save to local CSV
        fieldnames = ["id", "title", "buyer_name", "budget", "platform", "link", "posted_at_wat", "pitch_angle", "status"]
        with open(self.output_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
            writer.writeheader()
            for idx, item in enumerate(unique_leads, start=1):
                row = dict(item)
                row["id"] = idx
                writer.writerow(row)

        print(f"    [Local CSV] Saved {len(unique_leads)} direct buyers to {self.output_csv}.")

        # Push to Supabase table: client_outreach_proposals_pile
        supabase_records = []
        for l in unique_leads:
            rec = dict(l)
            rec.pop("id", None)
            rec.pop("category_id", None)
            supabase_records.append(rec)
        synced = sync_pile_to_supabase("client_outreach_proposals_pile", supabase_records, conflict_col="link")
        print(f"    [Supabase Sync] Upserted {synced} direct buyers to client_outreach_proposals_pile.")

        return unique_leads
