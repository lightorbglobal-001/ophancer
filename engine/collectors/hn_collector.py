import urllib.request
import json
import re
import html
from datetime import datetime, timezone
from engine.extractors import extract_budget, extract_work_mode, extract_skills
from engine.deduplicate import generate_opportunity_hash

class HackerNewsCollector:
    """
    Harvests authentic, direct startup and founder opportunities from
    the official Hacker News 'Who is hiring?' public API.
    Zero-cost, 100% genuine startup engineering, design & tech leads.
    """
    def __init__(self, limit: int = 15):
        self.limit = limit
        self.source_name = "Hacker News Startup"

    def classify_category(self, text: str) -> str:
        lower = text.lower()
        if any(w in lower for w in ['react', 'python', 'developer', 'web', 'frontend', 'backend', 'fullstack', 'software', 'app', 'code', 'api', 'rust', 'golang', 'node']):
            return 'web-dev'
        if any(w in lower for w in ['design', 'logo', 'graphic', 'ui', 'ux', 'figma', 'product design']):
            return 'graphic-design'
        if any(w in lower for w in ['data', 'analyst', 'sql', 'machine learning', 'ai', 'llm', 'ml']):
            return 'data-analysis'
        if any(w in lower for w in ['virtual assistant', 'support', 'customer success', 'operations', 'admin']):
            return 'va'
        if any(w in lower for w in ['content', 'writing', 'copywriter', 'social media', 'growth']):
            return 'social-media'
        return 'web-dev'

    def collect(self) -> list:
        opportunities = []
        user_url = "https://hacker-news.firebaseio.com/v0/user/whoishiring.json"
        
        try:
            req = urllib.request.Request(user_url, headers={'User-Agent': 'OphancerRadar/1.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                user_data = json.loads(resp.read().decode())
            
            submissions = user_data.get('submitted', [])
            if not submissions:
                return opportunities

            # Find latest "Who is hiring?" thread
            target_thread_id = None
            for sid in submissions[:6]:
                t_url = f"https://hacker-news.firebaseio.com/v0/item/{sid}.json"
                with urllib.request.urlopen(t_url, timeout=10) as resp:
                    t_item = json.loads(resp.read().decode())
                if t_item and 'who is hiring' in (t_item.get('title') or '').lower():
                    target_thread_id = sid
                    break

            if not target_thread_id:
                return opportunities

            # Fetch comments inside the hiring thread
            thread_url = f"https://hacker-news.firebaseio.com/v0/item/{target_thread_id}.json"
            with urllib.request.urlopen(thread_url, timeout=10) as resp:
                thread = json.loads(resp.read().decode())

            kids = thread.get('kids', [])[:self.limit * 2]
            for cid in kids:
                if len(opportunities) >= self.limit:
                    break
                try:
                    c_url = f"https://hacker-news.firebaseio.com/v0/item/{cid}.json"
                    with urllib.request.urlopen(c_url, timeout=8) as resp:
                        comment = json.loads(resp.read().decode())
                    
                    if not comment or comment.get('deleted') or comment.get('dead'):
                        continue

                    raw_text = comment.get('text', '')
                    if not raw_text or len(raw_text) < 40:
                        continue

                    clean_text = html.unescape(re.sub(r'<[^>]+>', ' ', raw_text)).strip()
                    clean_text = re.sub(r'\s+', ' ', clean_text)
                    first_line = clean_text.split('.')[0] if '.' in clean_text else clean_text[:120]

                    # Parse standard HN hiring header: "Company | Role | Location | Remote"
                    parts = [p.strip() for p in first_line.split('|') if p.strip()]
                    company = parts[0] if parts else f"@{comment.get('by', 'Founder')}"
                    title = parts[1] if len(parts) > 1 else first_line[:80]
                    location = "Global Remote / Africa Eligible"
                    
                    # Check for remote availability
                    if 'remote' in clean_text.lower():
                        location = "Global Remote / Worldwide"

                    # Check for direct email in the post
                    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', clean_text)
                    direct_email = email_match.group(0) if email_match else ""

                    cat_id = self.classify_category(title + " " + clean_text)
                    budget_info = extract_budget(clean_text)
                    skills = extract_skills(clean_text)
                    hn_url = f"https://news.ycombinator.com/item?id={cid}"

                    opp = {
                        "title": title[:90] if len(title) > 6 else f"{company} Hiring Call",
                        "slug": re.sub(r'[^a-z0-9]+', '-', f"{company}-{title}".lower()).strip('-')[:50],
                        "category_id": cat_id,
                        "category_name": "Web & Software Dev" if cat_id == "web-dev" else "Startup Opportunity",
                        "opportunity_type": "service_request",
                        "work_mode": "remote",
                        "location": location,
                        "currency": budget_info["currency"],
                        "min_budget": budget_info["min_budget"],
                        "max_budget": budget_info["max_budget"],
                        "budget_raw_text": budget_info["raw_text"],
                        "is_budget_negotiable": True,
                        "company_name": f"{company} (Hacker News Startup)",
                        "source_name": "Hacker News Startup",
                        "source_url": hn_url,
                        "direct_contact_email": direct_email,
                        "source_identifier": generate_opportunity_hash(first_line, "Hacker News", hn_url),
                        "discovered_at": datetime.now(timezone.utc).isoformat(),
                        "status": "published",
                        "description": clean_text[:1400],
                        "pitch_angle": "Reach out directly to the founders with a concise summary of your relevant live projects and GitHub/portfolio link.",
                        "tags": skills[:5] if skills else ["Startup Founder", "Direct Hiring", "Remote"]
                    }
                    opportunities.append(opp)
                except Exception:
                    continue

        except Exception as e:
            print(f"    [HackerNews Collector Error]: {e}")

        return opportunities
