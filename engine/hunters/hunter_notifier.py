import os
import json
import urllib.request
import time
from datetime import datetime, timezone

class HunterTelegramNotifier:
    """
    Dispatches real-time actionable lead alert cards to Telegram.
    1. Broadcasts to public channel @OphancerAlerts (free tier)
    2. Sends instant, private DMs to VIP & Trial subscribers based on their specific niche (e.g. VA only).
    """
    def __init__(self, bot_token: str = None, channel_id: str = None):
        self.bot_token = bot_token or os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
        self.channel_id = channel_id or os.environ.get("TELEGRAM_CHANNEL_ID", "").strip()
        self.supabase_url = os.environ.get("SUPABASE_URL", "https://vmhubcbjjawiiycdhipw.supabase.co").strip()
        self.supabase_key = os.environ.get("SUPABASE_SERVICE_KEY", "").strip()
        self.api_url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"

    def broadcast_buyer(self, lead: dict) -> bool:
        if not self.bot_token or not self.channel_id:
            return False

        title = lead.get("title", "Buyer Request")
        buyer = lead.get("buyer_name", "Direct Client")
        platform = lead.get("platform", "Social")
        budget = lead.get("budget", "Negotiable")
        posted = lead.get("posted_at_wat", "Today (WAT)")
        pitch = lead.get("pitch_angle", "Reach out with relevant portfolio and fast delivery turnaround.")
        link = lead.get("link", "")

        # 1. Public Channel Message
        text = (
            f"🎯 <b>FRESH DIRECT BUYER DROPPED</b>\n\n"
            f"📌 <b>Need:</b> {title}\n"
            f"👤 <b>Poster:</b> {buyer} ({platform})\n"
            f"💰 <b>Budget:</b> {budget}\n"
            f"⏰ <b>Posted:</b> {posted}\n\n"
            f"💡 <b>Recommended Pitch:</b>\n"
            f"<i>\"{pitch}\"</i>\n\n"
            f"⚡ <i>First to pitch usually wins the deal.</i>"
        )

        inline_keyboard = [
            [{"text": f"↗️ Open Post on {platform}", "url": link}],
            [{"text": "⭐ Get Private Alerts for Your Niche", "url": "https://t.me/OphancerAlertsBot?start=vip"}]
        ]

        sent = self._send(self.channel_id, text, inline_keyboard)

        # 2. VIP Targeted Direct Messages
        self.dispatch_vip_subscribers(lead, lead_type="buyer")
        return sent

    def broadcast_job(self, job: dict) -> bool:
        if not self.bot_token or not self.channel_id:
            return False

        title = job.get("job_title", "Vacant Position")
        company = job.get("company", "Verified Employer")
        location = job.get("location", "Abuja / Remote")
        salary = job.get("salary", "Negotiable")
        email = job.get("email", "")
        link = job.get("link", "")

        email_line = f"\n📧 <b>Recruiter Email:</b> <code>{email}</code>" if email and "@" in email else ""

        # 1. Public Channel Message
        text = (
            f"💼 <b>HIGH-PRIORITY JOB VACANCY</b>\n\n"
            f"📌 <b>Role:</b> {title}\n"
            f"🏢 <b>Company:</b> {company}\n"
            f"📍 <b>Location:</b> {location}\n"
            f"💰 <b>Salary:</b> {salary}{email_line}\n\n"
            f"🌟 <i>Priority: Abuja FCT or ₦250k+ Compensation</i>"
        )

        inline_keyboard = [
            [{"text": "↗️ Apply on Original Source", "url": link}],
            [{"text": "⭐ Get Private Alerts for Your Niche", "url": "https://t.me/OphancerAlertsBot?start=vip"}]
        ]

        sent = self._send(self.channel_id, text, inline_keyboard)

        # 2. VIP Targeted Direct Messages
        self.dispatch_vip_subscribers(job, lead_type="job")
        return sent

    def dispatch_vip_subscribers(self, item: dict, lead_type: str = "buyer"):
        """
        Sends private direct messages to active VIP and Trial subscribers whose keywords/categories match.
        """
        if not self.supabase_url or not self.supabase_key:
            return

        try:
            # Query active VIPs or valid trials from Supabase
            now_iso = datetime.now(timezone.utc).isoformat()
            query_url = (
                f"{self.supabase_url}/rest/v1/telegram_subscribers"
                f"?select=chat_id,first_name,category,location_pref,is_vip,trial_ends_at,is_active"
                f"&is_active=eq.true"
            )
            req = urllib.request.Request(
                query_url,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                subscribers = json.loads(resp.read().decode())
        except Exception as e:
            print(f"    [VIP Fetch Error]: {e}")
            return

        if not subscribers:
            return

        item_text = (
            (item.get("title", "") + " " + item.get("job_title", "") + " " + item.get("raw_text", "") + " " + item.get("location", ""))
        ).lower()

        for sub in subscribers:
            chat_id = sub.get("chat_id")
            cat = sub.get("category", "all")
            loc_pref = sub.get("location_pref", "all")

            # Check match
            if not self._matches_category(cat, item_text):
                continue
            if not self._matches_location(loc_pref, item_text):
                continue

            # Format Private VIP Direct Alert
            if lead_type == "buyer":
                vip_text = (
                    f"⚡ <b>VIP MATCH: DIRECT BUYER DROPPED</b>\n\n"
                    f"📌 <b>Need:</b> {item.get('title')}\n"
                    f"💰 <b>Budget:</b> {item.get('budget')}\n"
                    f"👤 <b>Client:</b> {item.get('buyer_name')} ({item.get('platform')})\n\n"
                    f"💡 <b>1-Click Pitch Ready to Copy:</b>\n"
                    f"<code>Hey {item.get('buyer_name', 'there')}, {item.get('pitch_angle')} Saw your post regarding: \"{item.get('title')}\". Let's chat!</code>\n\n"
                    f"<i>Sent instantly because your alert niche is set to {cat.upper()}.</i>"
                )
                buttons = [
                    [{"text": "↗️ Open Client Post", "url": item.get("link")}],
                    [{"text": "⚙️ Change My Settings", "url": "https://t.me/OphancerAlertsBot?start=settings"}]
                ]
            else:
                email_info = f"\n📧 <b>Email:</b> <code>{item.get('email')}</code>" if item.get("email") else ""
                vip_text = (
                    f"⚡ <b>VIP MATCH: HIGH-PAYING VACANCY</b>\n\n"
                    f"📌 <b>Role:</b> {item.get('job_title')}\n"
                    f"🏢 <b>Company:</b> {item.get('company')}\n"
                    f"📍 <b>Location:</b> {item.get('location')}\n"
                    f"💰 <b>Salary:</b> {item.get('salary')}{email_info}\n\n"
                    f"<i>Sent instantly to your VIP DM matching {cat.upper()}.</i>"
                )
                buttons = [
                    [{"text": "↗️ Apply Directly", "url": item.get("link")}],
                    [{"text": "⚙️ Change My Settings", "url": "https://t.me/OphancerAlertsBot?start=settings"}]
                ]

            self._send(chat_id, vip_text, buttons)
            print(f"    [*] 📲 VIP Alert dispatched to subscriber {chat_id} ({cat})")

    def _matches_category(self, cat: str, text: str) -> bool:
        if cat == "all":
            return True
        if cat == "va":
            return any(k in text for k in ["assistant", "va", "admin", "executive", "calendar", "data entry", "office", "personal assistant", "secretary"])
        if cat == "tech":
            return any(k in text for k in ["developer", "website", "wix", "react", "python", "software", "frontend", "fullstack", "wordpress"])
        if cat == "design":
            return any(k in text for k in ["design", "graphic", "ui", "ux", "logo", "illustrator", "video", "figma"])
        if cat == "data":
            return any(k in text for k in ["excel", "data", "power bi", "dashboard", "sql", "analyst", "sheets"])
        if cat == "writing":
            return any(k in text for k in ["writer", "writing", "copywriter", "content", "seo", "blog", "reels"])
        return True

    def _matches_location(self, loc_pref: str, text: str) -> bool:
        if loc_pref == "all":
            return True
        if loc_pref == "abuja":
            return "abuja" in text
        if loc_pref == "remote":
            return "remote" in text or "online" in text
        if loc_pref == "lagos":
            return "lagos" in text
        return True

    def _send(self, target_chat: str, text: str, inline_keyboard: list) -> bool:
        payload = {
            "chat_id": target_chat,
            "text": text,
            "parse_mode": "HTML",
            "reply_markup": {"inline_keyboard": inline_keyboard},
            "disable_web_page_preview": True
        }

        try:
            req = urllib.request.Request(
                self.api_url,
                data=json.dumps(payload).encode('utf-8'),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                res = json.loads(resp.read().decode('utf-8'))
                time.sleep(1.2)  # Respect rate limit
                return res.get("ok", False)
        except Exception as e:
            print(f"    [Telegram Notifier Error to {target_chat}]: {e}")
            return False
