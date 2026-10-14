import urllib.request
import xml.etree.ElementTree as ET
import re
import html
from datetime import datetime, timezone
from engine.extractors import extract_budget, extract_work_mode, extract_skills
from engine.deduplicate import normalize_url, generate_opportunity_hash

class NigeriaCollector:
    """
    Harvests authentic Nigerian vacancies and career opportunities across Lagos,
    Abuja, Port Harcourt, and Remote Nigeria with NGN compensation bands.
    """
    def __init__(self, feed_url: str = "https://www.hotnigerianjobs.com/feed/", max_items: int = 35):
        self.feed_url = feed_url
        self.source_name = "HotNigerianJobs NG"
        self.max_items = max_items

    def classify_category(self, text: str) -> str:
        lower = text.lower()
        if any(w in lower for w in ['developer', 'software', 'frontend', 'backend', 'fullstack', 'react', 'python', 'node', 'mobile', 'php', 'tech', 'programmer']):
            return 'web-dev'
        if any(w in lower for w in ['design', 'ui', 'ux', 'graphic', 'brand', 'multimedia', 'creative']):
            return 'graphic-design'
        if any(w in lower for w in ['accountant', 'finance', 'audit', 'banking', 'teller', 'treasury', 'financial']):
            return 'finance'
        if any(w in lower for w in ['data', 'analyst', 'sql', 'excel', 'powerbi', 'statistics']):
            return 'data-analysis'
        if any(w in lower for w in ['nurse', 'doctor', 'medical', 'pharmacist', 'hospital', 'clinical', 'health']):
            return 'healthcare'
        if any(w in lower for w in ['logistics', 'warehouse', 'driver', 'procurement', 'supply chain', 'dispatch']):
            return 'logistics'
        if any(w in lower for w in ['sales', 'marketing', 'business development', 'executive', 'commercial']):
            return 'sales'
        if any(w in lower for w in ['assistant', 'front desk', 'receptionist', 'admin', 'customer service', 'support', 'va', 'clerk', 'operations']):
            return 'va'
        return 'va'

    def _category_label(self, cat_id: str) -> str:
        mapping = {
            "web-dev": "Web & Software Dev",
            "graphic-design": "Graphic & Product Design",
            "finance": "Finance & Accounting",
            "data-analysis": "Data Analysis & Sheets",
            "healthcare": "Healthcare & Nursing",
            "logistics": "Logistics & Supply Chain",
            "sales": "Sales & Business",
            "va": "Virtual Assistance & Admin"
        }
        return mapping.get(cat_id, "Corporate & Admin")

    def parse_company_and_title(self, raw_title: str) -> tuple[str, str]:
        """
        Splits title into clean role title and company name.
        e.g. "Account Officer at Swift Energy Ltd" -> ("Account Officer", "Swift Energy Ltd")
        """
        title = raw_title
        company = "Verified Nigerian Employer"

        if " at " in raw_title:
            parts = raw_title.split(" at ", 1)
            title = parts[0].strip()
            company = parts[1].strip()
        elif " - " in raw_title:
            parts = raw_title.split(" - ", 1)
            title = parts[0].strip()
            company = parts[1].strip()

        # Clean common prefixes like 'Job Recruitment:' or 'Massive Recruitment:'
        title = re.sub(r'(?i)^(job\s+recruitment|massive\s+recruitment|vacancy|recruitment)\s*:?\s*', '', title).strip()
        return title, company

    def detect_nigerian_location(self, text: str) -> str:
        lower = text.lower()
        if 'lagos' in lower:
            return 'Lagos, Nigeria'
        if 'abuja' in lower or 'fct' in lower:
            return 'Abuja, Nigeria'
        if 'port harcourt' in lower or 'rivers' in lower:
            return 'Port Harcourt, Nigeria'
        if 'ibadan' in lower or 'oyo' in lower:
            return 'Ibadan, Nigeria'
        if 'remote' in lower:
            return 'Nigeria / Remote'
        return 'Lagos & Abuja, Nigeria'

    def collect(self) -> list:
        opportunities = []
        try:
            req = urllib.request.Request(
                self.feed_url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                }
            )
            with urllib.request.urlopen(req, timeout=28) as response:
                content = response.read()

            root = ET.fromstring(content)
            items = root.findall('.//item')

            for item in items[:self.max_items]:
                raw_title = html.unescape((item.findtext('title') or '').strip())
                raw_link = (item.findtext('link') or '').strip()
                raw_desc = (item.findtext('description') or '').strip()
                clean_desc = html.unescape(re.sub(r'<[^>]+>', ' ', raw_desc)).strip()
                clean_desc = re.sub(r'\s+', ' ', clean_desc)

                if not raw_title or not raw_link:
                    continue

                clean_title, company = self.parse_company_and_title(raw_title)
                location = self.detect_nigerian_location(raw_title + " " + clean_desc)
                work_mode = extract_work_mode(clean_desc + " " + raw_title)
                budget_info = extract_budget(clean_desc + " " + raw_title)
                category_id = self.classify_category(clean_title + " " + clean_desc)
                category_name = self._category_label(category_id)
                skills = extract_skills(clean_desc + " " + clean_title)

                opp_hash = generate_opportunity_hash(clean_title, company, raw_link)

                opp = {
                    "title": clean_title,
                    "slug": re.sub(r'[^a-z0-9]+', '-', clean_title.lower()).strip('-')[:50],
                    "category_id": category_id,
                    "category_name": category_name,
                    "opportunity_type": "job_vacancy",
                    "work_mode": work_mode,
                    "location": location,
                    "currency": "NGN",
                    "min_budget": budget_info["min_budget"],
                    "max_budget": budget_info["max_budget"],
                    "budget_raw_text": budget_info["raw_text"],
                    "is_budget_negotiable": budget_info["is_budget_negotiable"],
                    "company_name": company,
                    "source_name": self.source_name,
                    "source_url": normalize_url(raw_link),
                    "source_identifier": opp_hash,
                    "discovered_at": datetime.now(timezone.utc).isoformat(),
                    "status": "published",
                    "description": clean_desc[:1200],
                    "tags": skills or ["Nigeria Career", "Verified Opening", location.split(',')[0]]
                }
                opportunities.append(opp)

        except Exception as e:
            print(f"[NigeriaCollector Error] Failed to harvest {self.feed_url}: {e}")

        return opportunities
