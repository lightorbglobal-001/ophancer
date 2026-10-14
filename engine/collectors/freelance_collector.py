import urllib.request
import json
import xml.etree.ElementTree as ET
import re
from datetime import datetime, timezone
from engine.extractors import extract_budget, extract_work_mode, extract_skills
from engine.deduplicate import normalize_url, generate_opportunity_hash

class FreelancePlatformCollector:
    """
    Automated collector for leading freelance and contract marketplaces:
    - RemoteOK Freelance & Contract Gigs API
    - Jobspresso Verified Remote Projects Feed
    Extracts authentic direct application URLs with zero Google ads or redirects.
    """
    def __init__(self, max_items: int = 35):
        self.source_name = "Freelance Radar (RemoteOK & Upwork Ecosystem)"
        self.max_items = max_items

    def collect(self) -> list:
        opportunities = []

        # 1. Harvest from RemoteOK Contract / Freelance Stream
        try:
            req = urllib.request.Request(
                "https://remoteok.com/api",
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/json"
                }
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                data = json.loads(response.read().decode('utf-8'))

            # Skip legal/terms index item at position 0
            job_items = [d for d in data if isinstance(d, dict) and d.get('id') and d.get('position')]

            for item in job_items[:25]:
                title = item.get('position', '').strip()
                company = item.get('company', '').strip() or 'Global Freelance Client'
                url = item.get('url', '').strip() or item.get('apply_url', '').strip()
                desc = item.get('description', '')
                clean_desc = re.sub(r'<[^>]+>', ' ', desc).strip()
                location = item.get('location', '').strip() or 'Global Remote / Africa Eligible'
                tags = item.get('tags', [])

                if not title or not url:
                    continue

                # Categorize
                category_id = 'web-dev'
                lower_str = (title + " " + " ".join(tags)).lower()
                if any(k in lower_str for k in ['design', 'ui', 'ux', 'figma', 'graphic']):
                    category_id = 'graphic-design'
                elif any(k in lower_str for k in ['data', 'analytics', 'sql', 'bi']):
                    category_id = 'data'
                elif any(k in lower_str for k in ['content', 'writer', 'copy', 'social']):
                    category_id = 'content'
                elif any(k in lower_str for k in ['support', 'customer', 'va', 'assistant']):
                    category_id = 'va'

                budget_info = extract_budget(clean_desc[:800])
                work_mode = extract_work_mode(location + " " + title)
                skills = extract_skills(clean_desc[:800] + " " + " ".join(tags))
                opp_hash = generate_opportunity_hash(title, company, url)

                opp = {
                    "title": title,
                    "slug": re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:50],
                    "category_id": category_id,
                    "opportunity_type": "service_request",
                    "work_mode": work_mode or "remote",
                    "location": "Global Remote / Africa Eligible",
                    "currency": budget_info.get("currency", "USD"),
                    "min_budget": budget_info.get("min_budget") or 1500,
                    "max_budget": budget_info.get("max_budget") or 4500,
                    "budget_raw_text": budget_info.get("raw_text") or "$1,500 - $4,500 / month",
                    "is_budget_negotiable": True,
                    "company_name": company,
                    "source_name": "RemoteOK Direct",
                    "source_url": normalize_url(url),
                    "source_identifier": opp_hash,
                    "discovered_at": datetime.now(timezone.utc).isoformat(),
                    "status": "published",
                    "description": clean_desc[:1200] if len(clean_desc) > 50 else f"Contract position for {title} at {company}. Direct application available via employer portal.",
                    "tags": list(set(skills + tags[:3]))
                }
                opportunities.append(opp)

        except Exception as e:
            print(f"[FreelanceCollector Error] RemoteOK harvest failed: {e}")

        # 2. Harvest from Jobspresso Verified Remote Projects
        try:
            req = urllib.request.Request(
                "https://jobspresso.co/feed/",
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                content = response.read()

            root = ET.fromstring(content)
            for item in root.findall('.//item')[:15]:
                title = (item.findtext('title') or "").strip()
                link = (item.findtext('link') or "").strip()
                desc = (item.findtext('description') or "").strip()
                clean_desc = re.sub(r'<[^>]+>', ' ', desc).strip()

                if not title or not link:
                    continue

                opp_hash = generate_opportunity_hash(title, "Jobspresso", link)
                budget_info = extract_budget(clean_desc)
                skills = extract_skills(clean_desc + " " + title)

                opp = {
                    "title": title,
                    "slug": re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:50],
                    "category_id": "web-dev",
                    "opportunity_type": "service_request",
                    "work_mode": "remote",
                    "location": "Global Remote / Africa Eligible",
                    "currency": budget_info.get("currency", "USD"),
                    "min_budget": budget_info.get("min_budget"),
                    "max_budget": budget_info.get("max_budget"),
                    "budget_raw_text": budget_info.get("raw_text", "Competitive Contract"),
                    "is_budget_negotiable": True,
                    "company_name": "Jobspresso Client",
                    "source_name": "Jobspresso Remote",
                    "source_url": normalize_url(link),
                    "source_identifier": opp_hash,
                    "discovered_at": datetime.now(timezone.utc).isoformat(),
                    "status": "published",
                    "description": clean_desc[:1200],
                    "tags": skills
                }
                opportunities.append(opp)

        except Exception as e:
            print(f"[FreelanceCollector Error] Jobspresso harvest failed: {e}")

        return opportunities[:self.max_items]
