import os
import sys
import json
import time
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta

# Ensure UTF-8 printing
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# Load .env
if os.path.exists(".env"):
    try:
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    if k.strip() not in os.environ:
                        os.environ[k.strip()] = v.strip()
    except Exception:
        pass

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "8826949022:AAFV8WiCK-LwU2ogs2twiFqIBRTxyXzzRPM")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://vmhubcbjjawiiycdhipw.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

API_BASE = f"https://api.telegram.org/bot{BOT_TOKEN}"

# Categories Config
CATEGORIES = {
    "va": "💼 Virtual Assistant / Admin",
    "tech": "💻 Web & Tech Development",
    "design": "🎨 Design & Creative",
    "data": "📊 Data Entry & Excel / BI",
    "writing": "✍️ Content & Copywriting",
    "all": "🌐 All Opportunities"
}

LOCATIONS = {
    "all": "🌍 All Locations (Remote & Nigeria)",
    "remote": "🌐 100% Remote Only",
    "abuja": "📍 Abuja FCT Only",
    "lagos": "📍 Lagos Only"
}

def call_tg(endpoint: str, payload: dict) -> dict:
    url = f"{API_BASE}/{endpoint}"
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=35) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"[Telegram API Error - {endpoint}]: {e}")
        return {}

def call_supabase(endpoint: str, method: str = 'GET', data: dict = None, params: str = "") -> dict:
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    if params:
        url += f"?{params}"
    
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read().decode()
            return json.loads(content) if content else {}
    except Exception as e:
        print(f"[Supabase API Error - {endpoint}]: {e}")
        return {}

# ----------------- DATABASE HELPERS -----------------
def get_subscriber(chat_id: int):
    res = call_supabase("telegram_subscribers", method="GET", params=f"chat_id=eq.{chat_id}")
    return res[0] if isinstance(res, list) and len(res) > 0 else None

def register_or_update_subscriber(chat_id: int, username: str, first_name: str, category: str = "va", location_pref: str = "all"):
    existing = get_subscriber(chat_id)
    now_iso = datetime.now(timezone.utc).isoformat()

    if not existing:
        trial_end = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        payload = {
            "chat_id": chat_id,
            "username": username or "",
            "first_name": first_name or "",
            "category": category,
            "location_pref": location_pref,
            "is_vip": False,
            "is_active": True,
            "trial_ends_at": trial_end,
            "created_at": now_iso,
            "updated_at": now_iso
        }
        call_supabase("telegram_subscribers", method="POST", data=payload)
        return payload, True
    else:
        payload = {
            "username": username or existing.get("username", ""),
            "first_name": first_name or existing.get("first_name", ""),
            "is_active": True,
            "updated_at": now_iso
        }
        call_supabase("telegram_subscribers", method="PATCH", data=payload, params=f"chat_id=eq.{chat_id}")
        return {**existing, **payload}, False

def update_pref(chat_id: int, field: str, val):
    call_supabase("telegram_subscribers", method="PATCH", data={field: val, "updated_at": datetime.now(timezone.utc).isoformat()}, params=f"chat_id=eq.{chat_id}")

def activate_vip_subscription(chat_id: int, charge_id: str, stars: int):
    # Extend or activate 30 days VIP
    sub = get_subscriber(chat_id)
    now = datetime.now(timezone.utc)
    current_vip_until = None
    if sub and sub.get("vip_until"):
        try:
            current_vip_until = datetime.fromisoformat(sub["vip_until"].replace("Z", "+00:00"))
        except Exception:
            pass

    base_date = current_vip_until if current_vip_until and current_vip_until > now else now
    new_vip_until = (base_date + timedelta(days=30)).isoformat()

    # Update subscriber VIP status
    call_supabase("telegram_subscribers", method="PATCH", data={
        "is_vip": True,
        "vip_until": new_vip_until,
        "updated_at": now.isoformat()
    }, params=f"chat_id=eq.{chat_id}")

    # Log payment
    call_supabase("telegram_payments", method="POST", data={
        "chat_id": chat_id,
        "telegram_payment_charge_id": charge_id,
        "total_amount": stars,
        "currency": "XTR",
        "created_at": now.isoformat()
    })
    return new_vip_until

# ----------------- TELEGRAM MESSAGING -----------------
def send_msg(chat_id: int, text: str, reply_markup: dict = None):
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return call_tg("sendMessage", payload)

def send_stars_invoice(chat_id: int):
    """
    Sends native Telegram Stars (XTR) Invoice for VIP Alert Subscription
    100 Stars = ~$1.99 USD / ~₦2,800
    """
    payload = {
        "chat_id": chat_id,
        "title": "⭐ Ophancer VIP Alert Pass (30 Days)",
        "description": "Unlock instant, private DMs for high-paying vacancies & client requests in your niche (Virtual Assistant, Tech, etc.) with pre-written pitch hooks.",
        "payload": f"ophancer_vip_{chat_id}_{int(time.time())}",
        "currency": "XTR",
        "prices": [
            {"label": "30-Day VIP Pass", "amount": 100}
        ]
    }
    return call_tg("sendInvoice", payload)

# ----------------- KEYBOARD BUILDERS -----------------
def build_category_keyboard(current_cat: str):
    buttons = []
    for code, label in CATEGORIES.items():
        prefix = "✅ " if code == current_cat else ""
        buttons.append([{"text": f"{prefix}{label}", "callback_data": f"set_cat_{code}"}])
    buttons.append([{"text": "⬅️ Back to Settings", "callback_data": "menu_settings"}])
    return {"inline_keyboard": buttons}

def build_location_keyboard(current_loc: str):
    buttons = []
    for code, label in LOCATIONS.items():
        prefix = "✅ " if code == current_loc else ""
        buttons.append([{"text": f"{prefix}{label}", "callback_data": f"set_loc_{code}"}])
    buttons.append([{"text": "⬅️ Back to Settings", "callback_data": "menu_settings"}])
    return {"inline_keyboard": buttons}

def build_main_menu_keyboard(is_vip: bool):
    return {
        "inline_keyboard": [
            [
                {"text": "🎯 Set Job Niche", "callback_data": "menu_cat"},
                {"text": "📍 Location Filter", "callback_data": "menu_loc"}
            ],
            [
                {"text": "⭐ Upgrade to VIP (Telegram Stars)", "callback_data": "menu_buy_vip"}
            ],
            [
                {"text": "🌐 Open Ophancer Website", "url": "https://ophancer.com"}
            ]
        ]
    }

# ----------------- COMMAND HANDLERS -----------------
def handle_start(chat_id: int, username: str, first_name: str, start_param: str = ""):
    initial_cat = "va"
    if start_param in CATEGORIES:
        initial_cat = start_param

    sub, is_new = register_or_update_subscriber(chat_id, username, first_name, category=initial_cat)

    cat_label = CATEGORIES.get(sub.get("category", "va"), "Virtual Assistant")
    is_vip = sub.get("is_vip", False)

    trial_text = ""
    if not is_vip:
        trial_text = "\n🎁 <b>7-Day VIP Free Trial Active:</b> You will receive personal instant pings as new roles match your niche!\n"

    welcome_text = (
        f"👋 <b>Welcome, {first_name or 'there'}!</b>\n\n"
        f"You are connected to <b>Ophancer Job &amp; Client Alert Radar</b>.\n"
        f"Whenever verified roles or client inquiries drop, our 5-minute hunting engine checks your preferences and alerts you directly.\n"
        f"{trial_text}\n"
        f"📌 <b>Current Selected Niche:</b> {cat_label}\n"
        f"📍 <b>Location Preference:</b> {LOCATIONS.get(sub.get('location_pref', 'all'))}\n\n"
        f"<i>Tap below to customize your alerts or get a VIP Pass using Telegram Stars.</i>"
    )

    send_msg(chat_id, welcome_text, build_main_menu_keyboard(is_vip))

def handle_settings(chat_id: int):
    sub = get_subscriber(chat_id)
    if not sub:
        return handle_start(chat_id, "", "Friend")

    cat_label = CATEGORIES.get(sub.get("category", "va"), "Virtual Assistant")
    loc_label = LOCATIONS.get(sub.get("location_pref", "all"), "All Locations")
    status_label = "🌟 VIP Member" if sub.get("is_vip") else "🆓 Free Trial"

    settings_text = (
        f"⚙️ <b>Your Alert Preferences</b>\n\n"
        f"• <b>Status:</b> {status_label}\n"
        f"• <b>Target Niche:</b> {cat_label}\n"
        f"• <b>Location:</b> {loc_label}\n"
        f"• <b>Alert Delivery:</b> Real-time (Every 5 mins)\n\n"
        f"Choose what you'd like to update:"
    )

    keyboard = {
        "inline_keyboard": [
            [{"text": "🎯 Change Job Niche", "callback_data": "menu_cat"}],
            [{"text": "📍 Change Location", "callback_data": "menu_loc"}],
            [{"text": "⭐ Upgrade / Renew VIP (Stars)", "callback_data": "menu_buy_vip"}],
            [{"text": "⏸️ Pause Alerts", "callback_data": "toggle_pause"}]
        ]
    }
    send_msg(chat_id, settings_text, keyboard)

# ----------------- CALLBACK QUERY HANDLER -----------------
def handle_callback(cb: dict):
    cb_id = cb["id"]
    chat_id = cb["from"]["id"]
    data = cb.get("data", "")

    call_tg("answerCallbackQuery", {"callback_query_id": cb_id})

    if data == "menu_cat":
        sub = get_subscriber(chat_id) or {}
        curr = sub.get("category", "va")
        send_msg(chat_id, "🎯 <b>Select your primary job niche:</b>\nOnly jobs matching this category will vibrate your phone.", build_category_keyboard(curr))

    elif data.startswith("set_cat_"):
        new_cat = data.replace("set_cat_", "")
        update_pref(chat_id, "category", new_cat)
        cat_name = CATEGORIES.get(new_cat, new_cat)
        send_msg(chat_id, f"✅ <b>Updated!</b> Your alert niche is now: <b>{cat_name}</b>.\nAny new {cat_name} leads will be sent directly to you.", build_main_menu_keyboard(False))

    elif data == "menu_loc":
        sub = get_subscriber(chat_id) or {}
        curr = sub.get("location_pref", "all")
        send_msg(chat_id, "📍 <b>Select your preferred job location:</b>", build_location_keyboard(curr))

    elif data.startswith("set_loc_"):
        new_loc = data.replace("set_loc_", "")
        update_pref(chat_id, "location_pref", new_loc)
        loc_name = LOCATIONS.get(new_loc, new_loc)
        send_msg(chat_id, f"✅ <b>Location Updated!</b> You will only receive leads for: <b>{loc_name}</b>.", build_main_menu_keyboard(False))

    elif data == "menu_buy_vip":
        send_msg(chat_id, "🌟 <b>Opening Telegram Stars Checkout...</b>\nPay 100 Telegram Stars (~$1.99) for 30 days of private, instant VIP priority job alerts with pre-tested pitch angles.")
        send_stars_invoice(chat_id)

    elif data == "menu_settings":
        handle_settings(chat_id)

    elif data == "toggle_pause":
        sub = get_subscriber(chat_id) or {}
        new_active = not sub.get("is_active", True)
        update_pref(chat_id, "is_active", new_active)
        status_msg = "▶️ <b>Alerts Resumed!</b> You will receive matching jobs." if new_active else "⏸️ <b>Alerts Paused.</b> You will not receive pings until you resume."
        send_msg(chat_id, status_msg, build_main_menu_keyboard(False))

# ----------------- MAIN LONG-POLLING LOOP -----------------
def run_bot_service():
    print(f"🤖 [Ophancer Telegram VIP Bot] Started and listening for commands & Telegram Stars payments...")
    offset = 0

    while True:
        try:
            updates = call_tg("getUpdates", {"offset": offset, "timeout": 25})
            if updates and updates.get("ok"):
                for u in updates.get("result", []):
                    offset = u["update_id"] + 1

                    # 1. Handle Messages
                    if "message" in u:
                        msg = u["message"]
                        chat_id = msg["chat"]["id"]
                        first_name = msg["from"].get("first_name", "")
                        username = msg["from"].get("username", "")

                        # Handle Successful Payment with Telegram Stars
                        if "successful_payment" in msg:
                            payment = msg["successful_payment"]
                            charge_id = payment.get("telegram_payment_charge_id", f"stars_{int(time.time())}")
                            stars = payment.get("total_amount", 100)
                            new_expiry = activate_vip_subscription(chat_id, charge_id, stars)
                            
                            celebration_msg = (
                                f"🎉 <b>PAYMENT CONFIRMED!</b>\n\n"
                                f"⭐ <b>You are officially an Ophancer VIP Member!</b>\n"
                                f"• Payment: <b>{stars} Telegram Stars</b>\n"
                                f"• VIP Active Until: <b>{new_expiry.split('T')[0]}</b>\n\n"
                                f"🚀 <i>You will now receive private instant pings for your chosen niche within 10 seconds of discovery, complete with 1-click tailored pitch hooks.</i>"
                            )
                            send_msg(chat_id, celebration_msg, build_main_menu_keyboard(True))
                            continue

                        text = msg.get("text", "").strip()

                        if text.startswith("/start"):
                            parts = text.split(" ")
                            param = parts[1] if len(parts) > 1 else ""
                            handle_start(chat_id, username, first_name, param)

                        elif text.startswith("/settings") or text.startswith("/keywords"):
                            handle_settings(chat_id)

                        elif text.startswith("/vip") or text.startswith("/stars"):
                            send_stars_invoice(chat_id)

                        elif text.startswith("/pause"):
                            update_pref(chat_id, "is_active", False)
                            send_msg(chat_id, "⏸️ <b>Alerts Paused.</b> Send /resume anytime to restart your notifications.")

                        elif text.startswith("/resume"):
                            update_pref(chat_id, "is_active", True)
                            send_msg(chat_id, "▶️ <b>Alerts Resumed!</b> You will receive new matching leads.")

                        elif text.startswith("/help"):
                            help_msg = (
                                "ℹ️ <b>Ophancer Bot Commands:</b>\n\n"
                                "/start — Set up or reset your job alert profile\n"
                                "/settings — Change niche (VA, Web, Excel) or location\n"
                                "/vip — Purchase 30-Day VIP Pass with Telegram Stars\n"
                                "/pause — Temporarily pause job alerts\n"
                                "/resume — Resume receiving job alerts\n\n"
                                "Need human help? WhatsApp: wa.me/2348012345678"
                            )
                            send_msg(chat_id, help_msg)

                    # 2. Handle Pre-Checkout Query (Must approve within 10s for Telegram Stars)
                    elif "pre_checkout_query" in u:
                        pcq = u["pre_checkout_query"]
                        pcq_id = pcq["id"]
                        call_tg("answerPreCheckoutQuery", {"pre_checkout_query_id": pcq_id, "ok": True})
                        print(f"[*] Approved Pre-Checkout Query {pcq_id} for user {pcq.get('from', {}).get('id')}")

                    # 3. Handle Inline Button Clicks
                    elif "callback_query" in u:
                        handle_callback(u["callback_query"])

        except Exception as e:
            print(f"[Bot Polling Exception]: {e}")
            time.sleep(3)
        time.sleep(0.5)

if __name__ == "__main__":
    run_bot_service()
