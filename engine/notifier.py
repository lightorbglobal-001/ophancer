import urllib.request
import json
import time

class TelegramNotifier:
    def __init__(self, bot_token: str, channel_id: str, website_base_url: str = "https://ophancer.com"):
        self.bot_token = bot_token
        self.channel_id = channel_id
        self.website_base_url = website_base_url
        self.api_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

    def broadcast_opportunity(self, opp: dict) -> bool:
        """
        Sends an alert card to the Telegram channel.
        Includes title, company, location, budget, and inline action buttons.
        """
        if not self.bot_token or not self.channel_id:
            print("[Telegram] Bot token or channel ID not provided. Alert simulation active.")
            return False

        type_emoji = "⚡" if opp.get("opportunity_type") == "service_request" else "💼"
        type_badge = "CLIENT SERVICE REQUEST" if opp.get("opportunity_type") == "service_request" else "JOB VACANCY"

        text = (
            f"<b>{type_emoji} NEW OPPORTUNITY INDEXED</b>\n\n"
            f"<b>{opp.get('title')}</b>\n"
            f"🏢 <b>Company/Client:</b> {opp.get('company_name', 'Direct')}\n"
            f"📍 <b>Location:</b> {opp.get('location', 'Remote')}\n"
            f"💰 <b>Compensation:</b> {opp.get('budget_raw_text', 'Negotiable')}\n"
            f"🏷️ <b>Category:</b> {opp.get('category_name', 'General')}\n\n"
            f"<i>Discovered via Ophancer Discovery Radar</i>\n"
        )

        detail_url = f"{self.website_base_url}/opportunities/{opp.get('slug', '')}"
        source_url = opp.get("source_url", "")

        inline_keyboard = [
            [
                {"text": "🔍 View Full Details (Ophancer)", "url": detail_url},
                {"text": "↗️ Apply on Source", "url": source_url}
            ]
        ]

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
            with urllib.request.urlopen(req, timeout=10) as response:
                result = json.loads(response.read().decode('utf-8'))
                time.sleep(3)  # Anti-rate-limit sleep (respecting Telegram QPS)
                return result.get('ok', False)
        except Exception as e:
            print(f"[Telegram Error] Could not post alert: {e}")
            return False
