import urllib.request
import json
import re
import html
from datetime import datetime, timezone
from engine.extractors import extract_budget, extract_work_mode, extract_skills
from engine.deduplicate import normalize_url, generate_opportunity_hash

class RemotiveCollector:
    """
    Collects verified high-yield remote tech, design, marketing, and VA vacancies
    from the official Remotive Public API (0 rate limits, structured JSON).
    """
    def __init__(self, limit: int = 50):
        self.api_url = f"https://remotive.com/api/remote-jobs?limit={limit}"
        self.source_name = "Remotive Remote"

    def classify_category(self, remotive_cat: str, title: str) -> str:
        cat_lower = (remotive_cat or "").lower()
        title_lower = (title or "").lower()

        if any(w in cat_lower or w in title_lower for w in ['dev', 'software', 'frontend', 'backend', 'fullstack', 'engineer', 'react', 'python', 'node']):
            return 'web-dev'
        if any(w in cat_lower or w in title_lower for w in ['design', 'ui', 'ux', 'product design', 'graphic', 'figma']):
            return 'graphic-design'
        if any(w in cat_lower or w in title_lower for w in ['data', 'analytics', 'analyst', 'sql', 'bi', 'machine learning']):
            return 'data-analysis'
        if any(w in cat_lower or w in title_lower for w in ['customer', 'support', 'assistant', 'va', 'admin', 'operations']):
            return 'va'
        if any(w in cat_lower or w in title_lower for w in ['marketing', 'content', 'writing', 'copywriter', 'social']):
            return 'social-media'
        if any(w in cat_lower or w in title_lower for w in ['sales', 'business development', 'account']):
            return 'sales'
        return 'web-dev'

    def _category_label(self, cat_id: str) -> str:
        mapping = {
            "web-dev": "Web & Software Dev",
            "graphic-design": "Graphic & Product Design",
            "data-analysis": "Data Analysis & Sheets",
            "va": "Virtual Assistance & Admin",
            "social-media": "Social Media & Writing",
            "sales": "Sales & Business"
        }
        return mapping.get(cat_id, "Tech & Digital")

    def collect(self) -> list:
        opportunities = []
        try:
            req = urllib.request.Request(
                self.api_url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                }
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                payload = json.loads(response.read().decode('utf-8'))

            raw_jobs = payload.get("jobs", [])
            for job in raw_jobs:
                raw_title = job.get("title", "").strip()
                company = job.get("company_name", "Remote Employer").strip()
                source_url = job.get("url", "").strip()
                if not raw_title or not source_url:
                    continue

                category_id = self.classify_category(job.get("category", ""), raw_title)
                category_name = self._category_label(category_id)

                # Location formatting
                req_loc = job.get("candidate_required_location", "").strip()
                if not req_loc or any(w in req_loc.lower() for w in ['worldwide', 'anywhere', 'global']):
                    location = "Global Remote (Worldwide / Africa Eligible)"
                else:
                    location = f"Remote ({req_loc})"

                # Salary parsing
                salary_str = job.get("salary", "").strip()
                if salary_str:
                    budget_info = extract_budget(salary_str)
                    if budget_info["raw_text"] == "Negotiable / Competitive":
                        budget_info["raw_text"] = salary_str
                else:
                    budget_info = extract_budget(job.get("description", ""))

                # Strip HTML from description
                raw_desc = job.get("description", "")
                clean_desc = html.unescape(re.sub(r'<[^>]+>', ' ', raw_desc)).strip()
                clean_desc = re.sub(r'\s+', ' ', clean_desc)

                # Skill tags
                tags = job.get("tags", [])
                if not tags or not isinstance(tags, list):
                    tags = extract_skills(clean_desc + " " + raw_title)
                else:
                    tags = [str(t).strip() for t in tags[:5] if str(t).strip()]

                opp_hash = generate_opportunity_hash(raw_title, company, source_url)

                opp = {
                    "title": raw_title,
                    "slug": re.sub(r'[^a-z0-9]+', '-', raw_title.lower()).strip('-')[:50],
                    "category_id": category_id,
                    "category_name": category_name,
                    "opportunity_type": "job_vacancy",
                    "work_mode": "remote",
                    "location": location,
                    "currency": budget_info["currency"],
                    "min_budget": budget_info["min_budget"],
                    "max_budget": budget_info["max_budget"],
                    "budget_raw_text": budget_info["raw_text"],
                    "is_budget_negotiable": budget_info["is_budget_negotiable"],
                    "company_name": company,
                    "source_name": self.source_name,
                    "source_url": normalize_url(source_url),
                    "source_identifier": opp_hash,
                    "discovered_at": datetime.now(timezone.utc).isoformat(),
                    "status": "published",
                    "description": clean_desc[:1200],
                    "tags": tags or ["Remote", "Verified Employer"]
                }
                opportunities.append(opp)

        except Exception as e:
            print(f"[RemotiveCollector Error] Failed to harvest from {self.api_url}: {e}")

        return opportunities
