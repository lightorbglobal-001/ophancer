import os
import json
import urllib.request
import time

class HunterTelegramNotifier:
    """
    Dispatches real-time actionable lead alert cards to Telegram.
    Formats direct social buyer leads and high-priority corporate vacancies
    with direct buttons and pitch angles.
    """
    def __init__(self, bot_token: str = None, channel_id: str = None):
        self.bot_token = bot_token or os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
        self.channel_id = channel_id or os.environ.get("TELEGRAM_CHANNEL_ID", "").strip()
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
            [{"text": f"↗️ Open Post on {platform}", "url": link}]
        ]

        return self._send(text, inline_keyboard)

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

        text = (
            f"💼 <b>HIGH-PRIORITY JOB VACANCY</b>\n\n"
            f"📌 <b>Role:</b> {title}\n"
            f"🏢 <b>Company:</b> {company}\n"
            f"📍 <b>Location:</b> {location}\n"
            f"💰 <b>Salary:</b> {salary}{email_line}\n\n"
            f"🌟 <i>Priority: Abuja FCT or ₦250k+ Compensation</i>"
        )

        inline_keyboard = [
            [{"text": "↗️ Apply on Original Source", "url": link}]
        ]

        return self._send(text, inline_keyboard)

    def _send(self, text: str, inline_keyboard: list) -> bool:
        payload = {
            "chat_id": self.channel_id,
            "text": text,
            "parse_mode": "HTML",
            "reply_markup": {"inline_keyboard": inline_keyboard},
            "disable_web_page_preview": False
        }

        try:
            req = urllib.request.Request(
                self.api_url,
                data=json.dumps(payload).encode('utf-8'),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                res = json.loads(resp.read().decode('utf-8'))
                time.sleep(2.0)  # Respect Telegram rate limit
                return res.get("ok", False)
        except Exception as e:
            print(f"    [Telegram Notifier Error]: {e}")
            return False
