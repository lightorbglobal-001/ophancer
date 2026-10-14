import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
import re
import time
from datetime import datetime, timezone
import html
from engine.extractors import extract_budget, extract_work_mode, extract_skills
from engine.deduplicate import normalize_url, generate_opportunity_hash

class SocialCommunityCollector:
    """
    Harvests live client service requests and freelance opportunities
    from permitted social media communities, creator boards, and public forums.
    Includes rate-limit avoidance, polite delays, and automatic backoff retry logic.
    """
    def __init__(self, community_url: str, community_name: str, default_category: str = "web-dev"):
        self.community_url = community_url
        self.community_name = community_name
        self.source_name = community_name
        self.default_category = default_category

    def classify_category(self, text: str) -> str:
        lower = text.lower()
        if any(w in lower for w in ['react', 'python', 'developer', 'web', 'frontend', 'backend', 'fullstack', 'software', 'app', 'code', 'api', 'wordpress', 'shopify', 'node']):
            return 'web-dev'
        if any(w in lower for w in ['design', 'logo', 'graphic', 'ui', 'ux', 'figma', 'branding', 'illustration', '3d', 'model', 'photoshop']):
            return 'graphic-design'
        if any(w in lower for w in ['excel', 'spreadsheet', 'data', 'analyst', 'sql', 'tableau', 'financial', 'sheets']):
            return 'data-analysis'
        if any(w in lower for w in ['virtual assistant', 'va', 'admin', 'data entry', 'executive assistant', 'inbox', 'schedule', 'customer support', 'assistant']):
            return 'va'
        if any(w in lower for w in ['video', 'editor', 'content', 'social media', 'writing', 'copywriter', 'seo', 'ghostwriter', 'clippers']):
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

    def _fetch_content_with_retry(self, url: str) -> bytes | None:
        """
        Fetches URL content with rate-limit detection and exponential backoff retry.
        """
        # Polite pre-fetch pause to avoid triggering anti-bot shields
        time.sleep(2.0)

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/rss+xml, application/atom+xml, text/xml, */*",
            "Accept-Language": "en-US,en;q=0.9"
        }

        for attempt in range(2):
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=12) as response:
                    return response.read()
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    print(f"    [Rate-Limit Notice] HTTP 429 on {url} (attempt {attempt + 1}/2). Backing off for 4s...")
                    time.sleep(4.0)
                    headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0"
                else:
                    print(f"    [HTTP Error] {e.code} on {url}: {e.reason}")
                    return None
            except Exception as e:
                print(f"    [Network Error] on {url}: {e}")
                return None
        return None

    def collect(self) -> list:
        opportunities = []
        content = self._fetch_content_with_retry(self.community_url)
        if not content:
            return opportunities

        try:
            root = ET.fromstring(content)
            # Atom XML namespace
            ns = {'atom': 'http://www.w3.org/2005/Atom'}
            entries = root.findall('atom:entry', ns)

            # If not Atom, try standard RSS <item>
            items = [] if entries else root.findall('.//item')

            # 1. Process Atom entries
            for entry in entries[:25]:
                raw_title = html.unescape(entry.findtext('atom:title', default='', namespaces=ns).strip())
                lower_title = raw_title.lower()

                # Keep only hiring requests, exclude [For Hire]
                if not any(tag in lower_title for tag in ['[hiring]', 'hiring:', 'looking for', 'need a', 'gig:', 'seeking']):
                    continue
                if '[for hire]' in lower_title or '[forhire]' in lower_title:
                    continue

                clean_title = re.sub(r'(?i)^\s*\[hiring\]\s*:?\s*', '', raw_title).strip()
                if len(clean_title) < 5:
                    clean_title = raw_title

                link_elem = entry.find('atom:link', ns)
                raw_link = link_elem.attrib.get('href', '') if link_elem is not None else ''

                raw_content = entry.findtext('atom:content', default='', namespaces=ns)
                clean_desc = html.unescape(re.sub(r'<[^>]+>', ' ', raw_content)).strip()
                clean_desc = re.sub(r'\s+', ' ', clean_desc)

                if not clean_title or not raw_link:
                    continue

                budget_info = extract_budget(clean_desc + " " + clean_title)
                work_mode = extract_work_mode(clean_desc + " " + clean_title)
                skills = extract_skills(clean_desc + " " + clean_title)
                category = self.classify_category(clean_title + " " + clean_desc)
                opp_hash = generate_opportunity_hash(clean_title, self.community_name, raw_link)

                opp = {
                    "title": clean_title,
                    "slug": re.sub(r'[^a-z0-9]+', '-', clean_title.lower()).strip('-')[:50],
                    "category_id": category,
                    "category_name": self._category_label(category),
                    "opportunity_type": "service_request",
                    "work_mode": work_mode,
                    "location": "Global Remote / Africa Eligible",
                    "currency": budget_info["currency"],
                    "min_budget": budget_info["min_budget"],
                    "max_budget": budget_info["max_budget"],
                    "budget_raw_text": budget_info["raw_text"],
                    "is_budget_negotiable": budget_info["is_budget_negotiable"],
                    "company_name": f"{self.community_name} Direct Client",
                    "source_name": self.community_name,
                    "source_url": normalize_url(raw_link),
                    "source_identifier": opp_hash,
                    "discovered_at": datetime.now(timezone.utc).isoformat(),
                    "status": "published",
                    "description": clean_desc[:1400],
                    "tags": skills or ["Freelance Gig", "Direct Client", "Remote"]
                }
                opportunities.append(opp)

            # 2. Process Standard RSS items
            for item in items[:25]:
                raw_title = html.unescape((item.findtext('title') or '').strip())
                lower_title = raw_title.lower()

                if not any(tag in lower_title for tag in ['[hiring]', 'hiring:', 'looking for', 'need a', 'gig:', 'seeking']):
                    continue
                if '[for hire]' in lower_title or '[forhire]' in lower_title:
                    continue

                clean_title = re.sub(r'(?i)^\s*\[hiring\]\s*:?\s*', '', raw_title).strip()
                raw_link = (item.findtext('link') or '').strip()
                raw_desc = (item.findtext('description') or '').strip()
                clean_desc = html.unescape(re.sub(r'<[^>]+>', ' ', raw_desc)).strip()
                clean_desc = re.sub(r'\s+', ' ', clean_desc)

                if not clean_title or not raw_link:
                    continue

                budget_info = extract_budget(clean_desc + " " + clean_title)
                work_mode = extract_work_mode(clean_desc + " " + clean_title)
                skills = extract_skills(clean_desc + " " + clean_title)
                category = self.classify_category(clean_title + " " + clean_desc)
                opp_hash = generate_opportunity_hash(clean_title, self.community_name, raw_link)

                opp = {
                    "title": clean_title,
                    "slug": re.sub(r'[^a-z0-9]+', '-', clean_title.lower()).strip('-')[:50],
                    "category_id": category,
                    "category_name": self._category_label(category),
                    "opportunity_type": "service_request",
                    "work_mode": work_mode,
                    "location": "Global Remote / Africa Eligible",
                    "currency": budget_info["currency"],
                    "min_budget": budget_info["min_budget"],
                    "max_budget": budget_info["max_budget"],
                    "budget_raw_text": budget_info["raw_text"],
                    "is_budget_negotiable": budget_info["is_budget_negotiable"],
                    "company_name": f"{self.community_name} Direct Client",
                    "source_name": self.community_name,
                    "source_url": normalize_url(raw_link),
                    "source_identifier": opp_hash,
                    "discovered_at": datetime.now(timezone.utc).isoformat(),
                    "status": "published",
                    "description": clean_desc[:1400],
                    "tags": skills or ["Freelance Gig", "Direct Client", "Remote"]
                }
                opportunities.append(opp)

        except Exception as e:
            print(f"[SocialCommunityCollector Error] Parsing XML failed for {self.community_url}: {e}")

        return opportunities
