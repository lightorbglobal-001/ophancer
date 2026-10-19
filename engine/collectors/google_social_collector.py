import os
import urllib.request
import urllib.parse
import json
import re
import html
from datetime import datetime, timezone
from engine.extractors import extract_budget, extract_work_mode, extract_skills
from engine.deduplicate import normalize_url, generate_opportunity_hash

class GoogleSocialSearchCollector:
    """
    Harvests authentic, live direct client posts and founder hiring calls
    from Twitter/X, LinkedIn Posts, Facebook, and Threads using the
    official Google Custom Search JSON API (100 free queries/day).
    Zero CAPTCHAs, zero IP blocks, 100% legal & reliable.
    """
    def __init__(self, api_key: str = None, cx: str = None):
        self.api_key = api_key or os.environ.get("GOOGLE_SEARCH_API_KEY", "").strip()
        self.cx = cx or os.environ.get("GOOGLE_SEARCH_CX", "").strip()
        self.source_name = "Google Social Radar"

    def classify_category(self, text: str) -> str:
        lower = text.lower()
        if any(w in lower for w in ['react', 'python', 'developer', 'web', 'frontend', 'backend', 'fullstack', 'software', 'app', 'code', 'api', 'wordpress', 'shopify', 'node']):
            return 'web-dev'
        if any(w in lower for w in ['design', 'logo', 'graphic', 'ui', 'ux', 'figma', 'branding', 'illustration', '3d', 'photoshop', 'flyer']):
            return 'graphic-design'
        if any(w in lower for w in ['excel', 'spreadsheet', 'data', 'analyst', 'sql', 'tableau', 'financial', 'sheets']):
            return 'data-analysis'
        if any(w in lower for w in ['virtual assistant', 'va', 'admin', 'data entry', 'executive assistant', 'inbox', 'schedule', 'customer support', 'assistant']):
            return 'va'
        if any(w in lower for w in ['video', 'editor', 'content', 'social media', 'writing', 'copywriter', 'seo', 'ghostwriter', 'clippers', 'tiktok', 'reel', 'creator']):
            return 'social-media'
        return 'web-dev'

    def _category_label(self, cat_id: str) -> str:
        mapping = {
            "web-dev": "Web & Software Dev",
            "graphic-design": "Graphic & Product Design",
            "data-analysis": "Data Analysis & Sheets",
            "va": "Virtual Assistance & Admin",
            "social-media": "Social Media & Writing"
        }
        return mapping.get(cat_id, "General Tech")

    def _execute_google_query(self, query: str, platform_label: str) -> list:
        results = []
        if not self.api_key or not self.cx:
            return results

        encoded_q = urllib.parse.quote(query)
        url = f"https://www.googleapis.com/customsearch/v1?key={self.api_key}&cx={self.cx}&q={encoded_q}&num=10"

        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'OphancerRadar/1.0'})
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = json.loads(resp.read().decode('utf-8'))

            items = data.get('items', [])
            for item in items:
                raw_link = item.get('link', '')
                raw_title = item.get('title', '')
                snippet = item.get('snippet', '')

                if not raw_link or not raw_title:
                    continue

                clean_title = html.unescape(raw_title).strip()
                # Clean platform suffixes like " - X", " | LinkedIn", etc.
                clean_title = re.sub(r'\s*[-|]\s*(X|Twitter|LinkedIn|Facebook|Threads).*$', '', clean_title, flags=re.IGNORECASE).strip()
                clean_desc = html.unescape(snippet).strip()
                clean_desc = re.sub(r'\s+', ' ', clean_desc)

                composite = f"{clean_title} {clean_desc}"
                lower_comp = composite.lower()

                # Filter: verify this is an actual hiring/seeking client request
                if not any(k in lower_comp for k in ['looking for', 'need a', 'hiring', 'freelancer', 'contractor', 'dm me', 'send portfolio', 'rate', 'budget', 'developer', 'designer', 'editor']):
                    continue

                cat_id = self.classify_category(composite)
                budget_info = extract_budget(composite)
                work_mode = extract_work_mode(composite)
                skills = extract_skills(composite)

                # Extract platform specific author/username
                dm_url = raw_link
                client_handle = ""
                if 'x.com' in raw_link or 'twitter.com' in raw_link:
                    author_match = re.search(r'(?:x\.com|twitter\.com)/([a-zA-Z0-9_]+)', raw_link)
                    if author_match and author_match.group(1).lower() not in ['home', 'explore', 'search', 'intent']:
                        client_handle = f"@{author_match.group(1)}"
                        dm_url = f"https://x.com/messages/compose?recipient_id={author_match.group(1)}"

                elif 'threads.net' in raw_link:
                    author_match = re.search(r'threads\.net/@([a-zA-Z0-9_.]+)', raw_link)
                    if author_match:
                        client_handle = f"@{author_match.group(1)}"

                # Tailored pitch recommendation
                pitch_recommendations = {
                    "web-dev": "Mention 1-2 live web apps you've built, fast delivery timeline, and offer a quick 5-minute video demo.",
                    "graphic-design": "Share 2 direct links to relevant portfolio pieces matching their style. Mention immediate availability.",
                    "social-media": "Send 2 high-retention video/copy samples. Mention experience with hooks, pacing, and viral formats.",
                    "va": "Highlight prompt daily communication, attention to detail, and your availability in their time zone."
                }
                pitch_angle = pitch_recommendations.get(cat_id, "Reach out directly with 2 relevant sample links, your immediate availability, and a clear proposed turnaround.")

                opp = {
                    "title": clean_title[:90] if len(clean_title) > 10 else f"{clean_title} - {clean_desc[:40]}",
                    "slug": re.sub(r'[^a-z0-9]+', '-', clean_title.lower()).strip('-')[:50],
                    "category_id": cat_id,
                    "category_name": self._category_label(cat_id),
                    "opportunity_type": "service_request",
                    "work_mode": work_mode,
                    "location": "Global Remote / Africa Eligible",
                    "currency": budget_info["currency"],
                    "min_budget": budget_info["min_budget"],
                    "max_budget": budget_info["max_budget"],
                    "budget_raw_text": budget_info["raw_text"],
                    "is_budget_negotiable": budget_info["is_budget_negotiable"],
                    "company_name": f"{client_handle} ({platform_label})" if client_handle else f"{platform_label} Client",
                    "source_name": platform_label,
                    "source_url": normalize_url(raw_link),
                    "dm_url": dm_url,
                    "client_handle": client_handle,
                    "source_identifier": generate_opportunity_hash(clean_title, platform_label, raw_link),
                    "discovered_at": datetime.now(timezone.utc).isoformat(),
                    "status": "published",
                    "description": clean_desc[:1400],
                    "pitch_angle": pitch_angle,
                    "tags": skills[:5] if skills else ["Social Media Gig", "Direct Client", "Remote"]
                }
                results.append(opp)
        except Exception as e:
            print(f"    [Google Social Search Error] ({platform_label}): {e}")

        return results

    def collect(self) -> list:
        opportunities = []
        if not self.api_key or not self.cx:
            print("    [*] Google Social Radar: GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_CX not configured. Skipping.")
            return opportunities

        # Targeted social queries across all 4 platforms
        queries = [
            ('site:x.com ("looking for a" OR "need a" OR "hiring a") ("developer" OR "designer" OR "video editor" OR "virtual assistant") "DM"', "Twitter/X Direct"),
            ('site:linkedin.com/posts ("looking for a freelance" OR "hiring a contractor" OR "need someone to build")', "LinkedIn Posts"),
            ('site:facebook.com ("looking for a freelancer" OR "need a web developer" OR "hiring a video editor")', "Facebook Business"),
            ('site:threads.net ("looking for" OR "hiring") ("designer" OR "developer" OR "editor" OR "assistant")', "Threads Direct")
        ]

        for q, label in queries:
            print(f"    [Google Social Search]: Querying {label}...")
            found = self._execute_google_query(q, label)
            print(f"      -> Found {len(found)} opportunities on {label}.")
            opportunities.extend(found)

        return opportunities
