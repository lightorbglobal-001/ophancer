import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
import re
import time
from datetime import datetime, timezone
import html
from engine.extractors import extract_budget, extract_work_mode, extract_skills
from engine.deduplicate import normalize_url, generate_opportunity_hash

PHYSICAL_LABOR_REGEX = re.compile(
    r'\b(general laborer|laborers|manual labor|yard cleanup|yard work|debris removal|drywall|hauling|junk removal|moving help|furniture moving|heavy lifting|warehouse loading|forklift operator|house cleaner|house cleaning|maid service|in-person cleaner|housekeeper|lawn care|landscaping|mowing lawn|snow shoveling|roofing repair|handyman|plumbing repair|auto mechanic|car detailer|babysitter|nanny needed|dog walker)\b',
    re.IGNORECASE
)

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

                # Filter out in-person physical labor gigs
                if PHYSICAL_LABOR_REGEX.search(clean_title + " " + clean_desc):
                    continue

                # Extract specific subreddit and author for 1-click DM capability
                sub_match = re.search(r'/r/([^/]+)/', raw_link)
                actual_board = f"Reddit r/{sub_match.group(1)}" if sub_match else self.community_name

                author_elem = entry.find('atom:author/atom:name', ns)
                author_name = author_elem.text.strip() if (author_elem is not None and author_elem.text) else ""
                clean_author = re.sub(r'^/?u/', '', author_name).strip()
                dm_url = f"https://www.reddit.com/message/compose/?to={clean_author}&subject=Regarding%20your%20post" if clean_author else normalize_url(raw_link)

                budget_info = extract_budget(clean_desc + " " + clean_title)
                work_mode = extract_work_mode(clean_desc + " " + clean_title)
                skills = extract_skills(clean_desc + " " + clean_title)
                category = self.classify_category(clean_title + " " + clean_desc)
                opp_hash = generate_opportunity_hash(clean_title, actual_board, raw_link)

                # Tailored high-converting pitch recommendations based on category
                pitch_recommendations = {
                    "web-dev": "Highlight similar live sites or codebases you've shipped, fast turnaround, and offer a quick 5-minute walk-through demo.",
                    "graphic-design": "Share 2-3 direct links to relevant portfolio pieces matching their required aesthetic. Mention your turnaround and revision policy.",
                    "social-media": "Send 2 high-retention video or copy clips you produced. Mention familiarity with hooks, pacing, and trend formats.",
                    "va": "Highlight prompt daily communication, attention to detail, and your availability in their required time zone.",
                    "data-analysis": "Demonstrate expertise with clean spreadsheets, automated dashboards, or database scripts with zero fluff."
                }
                pitch_angle = pitch_recommendations.get(category, "Reach out with 2 relevant sample links, your immediate availability, and a concise delivery turnaround.")

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
                    "company_name": f"{author_name} ({actual_board})" if author_name else f"{actual_board} Direct Client",
                    "source_name": actual_board,
                    "source_url": normalize_url(raw_link),
                    "dm_url": dm_url,
                    "client_handle": clean_author,
                    "source_identifier": opp_hash,
                    "discovered_at": datetime.now(timezone.utc).isoformat(),
                    "status": "published",
                    "description": clean_desc[:1400],
                    "pitch_angle": pitch_angle,
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

                # Filter out in-person physical labor gigs
                if PHYSICAL_LABOR_REGEX.search(clean_title + " " + clean_desc):
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
