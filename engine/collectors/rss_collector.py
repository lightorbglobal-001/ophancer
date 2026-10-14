import urllib.request
import xml.etree.ElementTree as ET
import re
from datetime import datetime
from engine.extractors import extract_budget, extract_work_mode, extract_skills
from engine.deduplicate import normalize_url, generate_opportunity_hash

class RSSCollector:
    def __init__(self, feed_url: str, source_name: str, category_id: str = "web-dev"):
        self.feed_url = feed_url
        self.source_name = source_name
        self.category_id = category_id

    def collect(self) -> list:
        opportunities = []
        try:
            req = urllib.request.Request(
                self.feed_url,
                headers={"User-Agent": "OphancerBot/1.0 (+https://ophancer.com)"}
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                content = response.read()

            root = ET.fromstring(content)
            # Find all <item> in RSS 2.0 or <entry> in Atom
            items = root.findall('.//item')

            for item in items[:15]:
                title = (item.findtext('title') or "").strip()
                link = (item.findtext('link') or "").strip()
                description = (item.findtext('description') or "").strip()
                pub_date = (item.findtext('pubDate') or datetime.utcnow().isoformat()).strip()

                # Clean HTML tags from description
                clean_desc = re.sub(r'<[^>]+>', ' ', description).strip()

                if not title or not link:
                    continue

                budget_info = extract_budget(clean_desc)
                work_mode = extract_work_mode(clean_desc + " " + title)
                skills = extract_skills(clean_desc + " " + title)
                opp_hash = generate_opportunity_hash(title, self.source_name, link)

                opp = {
                    "title": title,
                    "slug": re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:50],
                    "category_id": self.category_id,
                    "opportunity_type": "job_vacancy",
                    "work_mode": work_mode,
                    "location": "Global Remote / Africa Eligible",
                    "currency": budget_info.get("currency", "USD"),
                    "min_budget": budget_info.get("min_budget"),
                    "max_budget": budget_info.get("max_budget"),
                    "budget_raw_text": budget_info.get("raw_text", "Negotiable"),
                    "is_budget_negotiable": budget_info.get("is_budget_negotiable", budget_info.get("is_negotiable", True)),
                    "company_name": self.source_name,
                    "source_name": self.source_name,
                    "source_url": normalize_url(link),
                    "source_identifier": opp_hash,
                    "discovered_at": datetime.utcnow().isoformat(),
                    "status": "published",
                    "description": clean_desc[:1200],
                    "tags": skills
                }
                opportunities.append(opp)

        except Exception as e:
            print(f"[RSSCollector Error] Failed to harvest {self.feed_url}: {e}")

        return opportunities
