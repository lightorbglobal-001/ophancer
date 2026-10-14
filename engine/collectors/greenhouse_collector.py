import urllib.request
import json
import re
from datetime import datetime
from engine.extractors import extract_budget, extract_work_mode, extract_skills
from engine.deduplicate import normalize_url, generate_opportunity_hash

class GreenhouseCollector:
    def __init__(self, company_token: str, company_name: str, category_id: str = "web-dev"):
        self.company_token = company_token
        self.company_name = company_name
        self.source_name = f"Greenhouse ({company_name})"
        self.category_id = category_id
        self.endpoint = f"https://boards-api.greenhouse.io/v1/boards/{company_token}/jobs?content=true"

    def collect(self) -> list:
        opportunities = []
        try:
            req = urllib.request.Request(
                self.endpoint,
                headers={"User-Agent": "OphancerBot/1.0 (+https://ophancer.com)"}
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                data = json.loads(response.read().decode('utf-8'))

            jobs = data.get('jobs', [])
            for job in jobs[:10]:
                title = job.get('title', '').strip()
                absolute_url = job.get('absolute_url', '').strip()
                content = job.get('content', '')
                location_name = (job.get('location', {}) or {}).get('name', 'Remote / Global')

                clean_desc = re.sub(r'<[^>]+>', ' ', content).strip()
                budget_info = extract_budget(clean_desc)
                work_mode = extract_work_mode(clean_desc + " " + location_name)
                skills = extract_skills(clean_desc + " " + title)
                opp_hash = generate_opportunity_hash(title, self.company_name, absolute_url)

                opp = {
                    "title": title,
                    "slug": re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')[:50],
                    "category_id": self.category_id,
                    "opportunity_type": "job_vacancy",
                    "work_mode": work_mode,
                    "location": location_name,
                    "currency": budget_info.get("currency", "USD"),
                    "min_budget": budget_info.get("min_budget"),
                    "max_budget": budget_info.get("max_budget"),
                    "budget_raw_text": budget_info.get("raw_text", "Negotiable"),
                    "is_budget_negotiable": budget_info.get("is_budget_negotiable", budget_info.get("is_negotiable", True)),
                    "company_name": self.company_name,
                    "source_name": "Greenhouse Public API",
                    "source_url": normalize_url(absolute_url),
                    "source_identifier": opp_hash,
                    "discovered_at": datetime.utcnow().isoformat(),
                    "status": "published",
                    "description": clean_desc[:1200],
                    "tags": skills
                }
                opportunities.append(opp)

        except Exception as e:
            print(f"[GreenhouseCollector Error] Failed for {self.company_token}: {e}")

        return opportunities
