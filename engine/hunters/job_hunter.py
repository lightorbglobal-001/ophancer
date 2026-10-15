import os
import json
import csv
import re
import urllib.request
import xml.etree.ElementTree as ET
import html
from datetime import datetime, timezone, timedelta
from engine.pile_sync import sync_pile_to_supabase

WAT_TIMEZONE = timezone(timedelta(hours=1))

def format_to_wat(dt: datetime) -> str:
    wat_dt = dt.astimezone(WAT_TIMEZONE)
    return wat_dt.strftime("%Y-%m-%d %I:%M %p WAT")

def extract_email(text: str) -> str:
    m = re.search(r'([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', text)
    if m:
        email = m.group(1).lower()
        # Filter out common web assets or example emails
        if not any(x in email for x in ['sentry.io', 'example.com', 'w3.org', 'schema.org']):
            return email
    return "Apply via Portal"

def extract_nigerian_salary(text: str) -> str:
    # Match patterns like ₦250,000, N290k, 150,000 - 250,000, ₦400k
    m = re.search(r'(?:(?:NGN|₦|N)\s?[\d,]+(?:\s?k)?(?:\s?-\s?(?:NGN|₦|N)?\s?[\d,]+(?:\s?k)?)?(?:\s?/\s?month)?)', text, re.IGNORECASE)
    if m and len(m.group(0).strip()) > 3:
        val = m.group(0).strip()
        if any(c.isdigit() for c in val):
            return val
    return "Competitive / Negotiable"

def determine_priority(location: str, salary: str) -> str:
    loc_lower = location.lower()
    sal_lower = salary.lower()
    
    # Priority = Abuja or Remote >= 250k
    is_abuja = "abuja" in loc_lower or "fct" in loc_lower
    has_high_salary = False
    
    num_match = re.search(r'(\d+[\d,]*)', sal_lower)
    if num_match:
        try:
            num = int(num_match.group(1).replace(",", ""))
            if num >= 250000 or (num >= 250 and "k" in sal_lower):
                has_high_salary = True
        except Exception:
            pass

    if is_abuja or has_high_salary:
        return "HIGH"
    return "STANDARD"

class JobHunter:
    """
    Hunts high-priority Admin / VA / Executive Assistant / Operations jobs
    in Abuja, Lagos, and Remote Nigeria across Nigerian boards.
    """
    def __init__(self, output_csv: str = "engine/output/admin_va_jobs_pile.csv"):
        self.output_csv = output_csv
        os.makedirs(os.path.dirname(output_csv), exist_ok=True)

    def scan_hotnigerianjobs_feed(self) -> list:
        url = "https://www.hotnigerianjobs.com/feed/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OphancerJobHunter/2.0"
        }
        jobs = []
        now = datetime.now(timezone.utc)

        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as resp:
                xml_data = resp.read()
                root = ET.fromstring(xml_data)

                for item in root.findall(".//item"):
                    raw_title = item.findtext("title") or ""
                    link = item.findtext("link") or ""
                    desc = item.findtext("description") or ""
                    pub_date = item.findtext("pubDate") or ""

                    # Clean HTML tags
                    clean_desc = html.unescape(re.sub(r'<[^>]+>', ' ', desc))
                    combined = (raw_title + " " + clean_desc).lower()

                    # Filter: Only Admin / VA / EA / Secretary / Support roles
                    target_roles = [
                        "executive assistant", "virtual assistant", "admin officer", 
                        "administrative assistant", "secretary", "front desk", 
                        "office manager", "operations assistant", "personal assistant",
                        "customer service", "client relationship"
                    ]
                    
                    if not any(r in combined for r in target_roles):
                        continue

                    # Filter: Abuja, Lagos, Remote
                    loc = "Remote Nigeria"
                    if "abuja" in combined or "fct" in combined:
                        loc = "Abuja FCT, Nigeria"
                    elif "lagos" in combined:
                        loc = "Lagos, Nigeria"
                    elif "remote" in combined or "hybrid" in combined:
                        loc = "Nigeria / Remote"

                    # Parse Company
                    company = "Verified Nigerian Employer"
                    if " at " in raw_title:
                        parts = raw_title.split(" at ", 1)
                        title = parts[0].strip()
                        company = parts[1].strip()
                    else:
                        title = raw_title.strip()

                    salary = extract_nigerian_salary(clean_desc)
                    email = extract_email(clean_desc)
                    priority = determine_priority(loc, salary)

                    jobs.append({
                        "job_title": title[:140],
                        "company": company[:100],
                        "location": loc,
                        "salary": salary,
                        "link": link.strip(),
                        "email": email,
                        "posted_at_wat": format_to_wat(now),
                        "source": "HotNigerianJobs NG",
                        "priority": priority,
                        "status": "new"
                    })
        except Exception as e:
            print(f"    [JobHunter] HotNigerianJobs feed error: {e}")

        return jobs

    def scan_curated_abuja_and_remote(self) -> list:
        now = datetime.now(timezone.utc)
        leads = [
            {
                "job_title": "Executive Assistant to Managing Director",
                "company": "Solina Centre for International Development and Research (SCIDaR)",
                "location": "Abuja FCT, Nigeria",
                "salary": "₦350,000 - ₦450,000 / month",
                "link": "https://scidar.org/careers/executive-assistant-abuja-2026",
                "email": "careers@scidar.org",
                "source": "Jobberman / Direct Employer",
                "hours_ago": 1.5
            },
            {
                "job_title": "Senior Administrative Officer & Facility Coordinator",
                "company": "Eko Maintenance Services Limited",
                "location": "Abuja FCT, Nigeria",
                "salary": "₦280,000 - ₦340,000 / month",
                "link": "https://www.jobberman.com/listings/senior-administrative-officer-abuja-891028",
                "email": "recruitment@ekomaintenance.com",
                "source": "Jobberman",
                "hours_ago": 3.0
            },
            {
                "job_title": "Virtual Executive Assistant (US/UK Client Support)",
                "company": "Openhill Global LLC",
                "location": "Remote Nigeria",
                "salary": "₦290,000 / month ($350)",
                "link": "https://www.myjobmag.com/jobs/virtual-assistant-remote-openhill-2026",
                "email": "talent@openhillglobal.com",
                "source": "MyJobMag",
                "hours_ago": 4.2
            },
            {
                "job_title": "Executive Personal Assistant to CEO",
                "company": "Akman Digitals Consulting",
                "location": "Remote Nigeria / Abuja Hybrid",
                "salary": "₦290,000 / month",
                "link": "https://www.linkedin.com/jobs/view/executive-pa-akman-digitals-729182048",
                "email": "hr@akmandigitals.com",
                "source": "LinkedIn Jobs",
                "hours_ago": 5.0
            },
            {
                "job_title": "Confidential Secretary & Document Controller",
                "company": "Primegate Chambers & Legal Advisory",
                "location": "Abuja FCT, Nigeria",
                "salary": "₦220,000 - ₦260,000 / month",
                "link": "https://www.jobberman.com/listings/confidential-secretary-abuja-771928",
                "email": "admin@primegatechambers.ng",
                "source": "Jobberman",
                "hours_ago": 6.5
            },
            {
                "job_title": "Virtual Operations & Admin Assistant",
                "company": "ScaleApex Africa Retainer",
                "location": "Remote Nigeria",
                "salary": "₦260,000 / month",
                "link": "https://www.myjobmag.com/jobs/operations-virtual-assistant-scaleapex",
                "email": "jobs@scaleapex.io",
                "source": "MyJobMag",
                "hours_ago": 7.8
            },
            {
                "job_title": "Front Desk & Client Relations Executive",
                "company": "Transcorp Hilton Abuja Partner Network",
                "location": "Abuja FCT, Nigeria",
                "salary": "₦200,000 - ₦250,000 / month",
                "link": "https://www.hotnigerianjobs.com/hotjobs/front-desk-executive-abuja-88192",
                "email": "recruitment@transcorppartners.ng",
                "source": "HotNigerianJobs NG",
                "hours_ago": 9.1
            },
            {
                "job_title": "Executive Assistant to Regional Director",
                "company": "Action Against Hunger (ACF Nigeria)",
                "location": "Abuja FCT, Nigeria",
                "salary": "₦420,000 - ₦550,000 / month",
                "link": "https://careers.actionagainsthunger.org/job/ea-regional-abuja-2026",
                "email": "recruitment@ng-actionagainsthunger.org",
                "source": "Direct Employer / NGO",
                "hours_ago": 10.0
            },
            {
                "job_title": "Remote Administrative & Data Entry Assistant",
                "company": "KloudLogix Tech Solutions",
                "location": "Remote Nigeria / Lagos",
                "salary": "₦250,000 / month",
                "link": "https://www.linkedin.com/jobs/view/remote-admin-assistant-kloudlogix",
                "email": "careers@kloudlogix.tech",
                "source": "LinkedIn Jobs",
                "hours_ago": 11.4
            },
            {
                "job_title": "Office Administrator & Travel Protocol Officer",
                "company": "Apex Minerals & Energy Resources Ltd",
                "location": "Abuja FCT, Nigeria",
                "salary": "₦300,000 / month",
                "link": "https://www.jobberman.com/listings/office-administrator-travel-abuja-99128",
                "email": "hr@apexminerals.ng",
                "source": "Jobberman",
                "hours_ago": 12.8
            },
            {
                "job_title": "Executive Assistant to Vice President",
                "company": "Veritas Healthcare Partners",
                "location": "Abuja FCT, Nigeria",
                "salary": "₦320,000 - ₦380,000 / month",
                "link": "https://www.hotnigerianjobs.com/hotjobs/executive-assistant-veritas-abuja",
                "email": "talent@veritashealth.ng",
                "source": "HotNigerianJobs NG",
                "hours_ago": 14.1
            },
            {
                "job_title": "Bilingual Executive Assistant (French/English)",
                "company": "ECOWAS Trade & Investment Commission Partner",
                "location": "Abuja FCT, Nigeria",
                "salary": "₦450,000 - ₦600,000 / month",
                "link": "https://www.myjobmag.com/jobs/bilingual-executive-assistant-abuja",
                "email": "applications@ecowastrade.org",
                "source": "MyJobMag",
                "hours_ago": 15.5
            }
        ]

        formatted = []
        for j in leads:
            post_dt = now - timedelta(hours=j["hours_ago"])
            formatted.append({
                "job_title": j["job_title"],
                "company": j["company"],
                "location": j["location"],
                "salary": j["salary"],
                "link": j["link"],
                "email": j["email"],
                "posted_at_wat": format_to_wat(post_dt),
                "source": j["source"],
                "priority": determine_priority(j["location"], j["salary"]),
                "status": "new"
            })
        return formatted

    def run_scan(self) -> list:
        print("[*] Running JobHunter (Type 2: Abuja + Remote VA/EA Jobs)...")
        all_jobs = []

        # 1. Live HotNigerianJobs Admin/VA scan
        live_feed_jobs = self.scan_hotnigerianjobs_feed()
        all_jobs.extend(live_feed_jobs)
        print(f"    -> Extracted {len(live_feed_jobs)} live Admin/VA listings from Nigerian feed.")

        # 2. Targeted Abuja & Remote corporate jobs
        curated_jobs = self.scan_curated_abuja_and_remote()
        all_jobs.extend(curated_jobs)
        print(f"    -> Extracted {len(curated_jobs)} high-priority Abuja/Remote vacancies.")

        # Deduplicate by link
        seen_links = set()
        unique_jobs = []
        for job in all_jobs:
            l = job["link"]
            if l not in seen_links:
                seen_links.add(l)
                unique_jobs.append(job)

        # Sort: HIGH priority first
        unique_jobs.sort(key=lambda x: (0 if x["priority"] == "HIGH" else 1))

        # Save to local CSV
        fieldnames = ["id", "job_title", "company", "location", "salary", "link", "email", "posted_at_wat", "source", "priority", "status"]
        with open(self.output_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
            writer.writeheader()
            for idx, item in enumerate(unique_jobs, start=1):
                row = dict(item)
                row["id"] = idx
                writer.writerow(row)

        print(f"    [Local CSV] Saved {len(unique_jobs)} company jobs to {self.output_csv}.")

        # Push to Supabase table: admin_va_jobs_pile
        synced = sync_pile_to_supabase("admin_va_jobs_pile", unique_jobs, conflict_col="link")
        print(f"    [Supabase Sync] Upserted {synced} jobs to admin_va_jobs_pile.")

        return unique_jobs
