import urllib.request
import urllib.parse
import re
import html
import time
from datetime import datetime, timezone
from engine.extractors import extract_budget, extract_work_mode, extract_skills
from engine.deduplicate import normalize_url, generate_opportunity_hash

class SocialRadarCollector:
    """
    Harvests live client gigs, founder hiring calls, and freelance vacancies 
    from public social networks (Facebook, X/Twitter, Threads, TikTok)
    using zero-cost, unblocked public search syndication without login barriers.
    """
    def __init__(self, platform: str, query: str, platform_label: str, default_category: str = "web-dev"):
        self.platform = platform
        self.query = query
        self.source_name = platform_label
        self.default_category = default_category

    def classify_category(self, text: str) -> str:
        lower = text.lower()
        if any(w in lower for w in ['react', 'python', 'developer', 'web', 'frontend', 'backend', 'fullstack', 'software', 'app', 'code', 'api', 'wordpress', 'shopify', 'node']):
            return 'web-dev'
        if any(w in lower for w in ['design', 'logo', 'graphic', 'ui', 'ux', 'figma', 'branding', 'illustration', '3d', 'model', 'photoshop', 'flyer']):
            return 'graphic-design'
        if any(w in lower for w in ['excel', 'spreadsheet', 'data', 'analyst', 'sql', 'tableau', 'financial', 'sheets']):
            return 'data-analysis'
        if any(w in lower for w in ['virtual assistant', 'va', 'admin', 'data entry', 'executive assistant', 'inbox', 'schedule', 'customer support', 'assistant', 'customer service']):
            return 'va'
        if any(w in lower for w in ['video', 'editor', 'content', 'social media', 'writing', 'copywriter', 'seo', 'ghostwriter', 'clippers', 'tiktok', 'reel', 'creator']):
            return 'social-media'
        return self.default_category

    def _category_label(self, cat_id: str) -> str:
        mapping = {
            "web-dev": "Web & Software Dev",
            "graphic-design": "Graphic & Product Design",
            "data-analysis": "Data Analysis & Sheets",
            "va": "Virtual Assistance & Admin",
            "social-media": "Social Media & Writing"
        }
        return mapping.get(cat_id, "General Tech")

    def collect(self) -> list:
        opportunities = []
        time.sleep(2.0)  # Polite pause between social radar queries

        encoded_query = urllib.parse.quote(self.query)
        url = f"https://html.duckduckgo.com/html/?q={encoded_query}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
        }

        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=12) as response:
                content = response.read().decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"    [Social Radar Error] ({self.source_name}): {e}")
            return opportunities

        # Extract search results from DuckDuckGo HTML output
        matches = re.findall(
            r'<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>',
            content,
            re.IGNORECASE | re.DOTALL
        )
        snippets = re.findall(
            r'<a[^>]+class="result__snippet"[^>]*>(.*?)</a>',
            content,
            re.IGNORECASE | re.DOTALL
        )

        print(f"    [{self.source_name}] Raw response bytes: {len(content)}, Regex matches: {len(matches)}")

        seen_links = set()

        for idx, (raw_link, raw_title) in enumerate(matches[:12]):
            # Decode actual target social media URL
            target_url = raw_link
            if "uddg=" in raw_link:
                uddg_match = re.search(r'uddg=([^&]+)', raw_link)
                if uddg_match:
                    target_url = urllib.parse.unquote(uddg_match.group(1))

            target_url = normalize_url(target_url)
            if not target_url or target_url in seen_links:
                continue
            seen_links.add(target_url)

            clean_title = re.sub(r'<[^>]+>', '', html.unescape(raw_title)).strip()
            # Clean trailing platform suffixes
            clean_title = re.sub(r'\s*-\s*(Facebook|X|Twitter|Threads|TikTok).*$', '', clean_title, flags=re.IGNORECASE).strip()

            snippet_text = ""
            if idx < len(snippets):
                snippet_text = re.sub(r'<[^>]+>', '', html.unescape(snippets[idx])).strip()

            composite_text = f"{clean_title} {snippet_text}"
            lower_composite = composite_text.lower()

            # Ensure the post is an actual hiring/vacancy/gig opportunity
            if not any(term in lower_composite for term in [
                'hiring', 'vacancy', 'job', 'looking for', 'need a', 'gig', 
                'freelancer', 'recruiting', 'apply', 'role', 'assistant', 'designer', 
                'developer', 'editor', 'salary', 'dm to apply', 'send cv', 'portfolio'
            ]):
                continue

            # Classify category & extract intelligence
            cat_id = self.classify_category(composite_text)
            budget_info = extract_budget(composite_text)
            work_mode = extract_work_mode(composite_text)
            skills = extract_skills(composite_text)

            # Location intelligence
            location = "Nigeria / Remote"
            if "lagos" in lower_composite:
                location = "Lagos, Nigeria"
            elif "abuja" in lower_composite:
                location = "Abuja, Nigeria"
            elif "remote" in lower_composite or work_mode == "remote":
                location = "Remote / Online"

            # Clean slug
            slug_base = re.sub(r'[^a-z0-9]+', '-', clean_title.lower()).strip('-')[:50]

            opp = {
                "title": clean_title if len(clean_title) > 10 else f"{clean_title} - {snippet_text[:40]}",
                "slug": slug_base,
                "category_id": cat_id,
                "category_name": self._category_label(cat_id),
                "opportunity_type": "service_request",
                "work_mode": work_mode,
                "location": location,
                "currency": budget_info["currency"],
                "min_budget": budget_info["min_budget"],
                "max_budget": budget_info["max_budget"],
                "budget_raw_text": budget_info["raw_text"],
                "is_budget_negotiable": budget_info["is_budget_negotiable"],
                "company_name": f"{self.source_name} Creator / Client",
                "source_name": self.source_name,
                "source_url": target_url,
                "source_identifier": generate_opportunity_hash(clean_title, self.source_name, target_url),
                "discovered_at": datetime.now(timezone.utc).isoformat(),
                "status": "published",
                "description": snippet_text or clean_title,
                "tags": skills[:5] if skills else ["Social Client Gig"]
            }

            opportunities.append(opp)

        return opportunities
