import os
import sys
import json
import time
import urllib.request
import urllib.parse
import requests
from datetime import datetime, timezone, timedelta

try:
    from engine.telegram_bot.quote_generator import generate_quote_slip, parse_currency_and_amount
except ImportError:
    from quote_generator import generate_quote_slip, parse_currency_and_amount

# In-memory quote creation sessions
QUOTE_SESSIONS = {}

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

# Categories Config - Inclusive of All Nigerian Job Sectors
CATEGORIES = {
    "all": "🌐 All Opportunities",
    "ngo": "🤝 NGO & Humanitarian",
    "finance": "🏦 Banking & Finance",
    "energy": "⚡ Oil, Gas & Energy",
    "healthcare": "🏥 Healthcare & Medical",
    "education": "📚 Education & Teaching",
    "admin": "💼 Executive Admin & VA",
    "logistics": "🚚 Logistics & Supply",
    "sales": "🛍️ Sales & Marketing",
    "hospitality": "🍽️ Hospitality & Tourism",
    "legal": "⚖️ Legal & Compliance",
    "tech": "💻 Web & Software Dev",
    "design": "🎨 Creative & Design"
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
        payload = {
            "chat_id": chat_id,
            "username": username or "",
            "first_name": first_name or "",
            "category": category,
            "location_pref": location_pref,
            "is_vip": True,
            "is_active": True,
            "trial_ends_at": None,
            "created_at": now_iso,
            "updated_at": now_iso
        }
        call_supabase("telegram_subscribers", method="POST", data=payload)
        return payload, True
    else:
        payload = {
            "username": username or existing.get("username", ""),
            "first_name": first_name or existing.get("first_name", ""),
            "is_vip": True,
            "is_active": True,
            "updated_at": now_iso
        }
        call_supabase("telegram_subscribers", method="PATCH", data=payload, params=f"chat_id=eq.{chat_id}")
        return {**existing, **payload}, False

def update_pref(chat_id: int, field: str, val):
    call_supabase("telegram_subscribers", method="PATCH", data={field: val, "updated_at": datetime.now(timezone.utc).isoformat()}, params=f"chat_id=eq.{chat_id}")

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

def build_category_keyboard(current_cat: str):
    buttons = []
    all_label = CATEGORIES.get("all", "🌐 All Opportunities")
    prefix_all = "✅ " if current_cat == "all" else ""
    buttons.append([{"text": f"{prefix_all}{all_label}", "callback_data": "set_cat_all"}])

    other_cats = [(k, v) for k, v in CATEGORIES.items() if k != "all"]
    for i in range(0, len(other_cats), 2):
        row = []
        for code, label in other_cats[i:i+2]:
            prefix = "✅ " if code == current_cat else ""
            row.append({"text": f"{prefix}{label}", "callback_data": f"set_cat_{code}"})
        buttons.append(row)

    buttons.append([{"text": "⬅️ Back to Settings", "callback_data": "menu_settings"}])
    return {"inline_keyboard": buttons}

def build_location_keyboard(current_loc: str):
    buttons = []
    for code, label in LOCATIONS.items():
        prefix = "✅ " if code == current_loc else ""
        buttons.append([{"text": f"{prefix}{label}", "callback_data": f"set_loc_{code}"}])
    buttons.append([{"text": "⬅️ Back to Settings", "callback_data": "menu_settings"}])
    return {"inline_keyboard": buttons}

def send_photo(chat_id: int, image_path: str, caption: str = "", reply_markup: dict = None):
    url = f"{API_BASE}/sendPhoto"
    data = {"chat_id": chat_id, "caption": caption, "parse_mode": "HTML"}
    if reply_markup:
        data["reply_markup"] = json.dumps(reply_markup)
    try:
        with open(image_path, "rb") as f:
            files = {"photo": f}
            r = requests.post(url, data=data, files=files, timeout=40)
            return r.json()
    except Exception as e:
        print("[sendPhoto Error]:", e)
        return {}

def download_tg_file(file_id: str, dest_path: str) -> str:
    res = call_tg("getFile", {"file_id": file_id})
    if res and res.get("ok"):
        file_path = res["result"].get("file_path")
        download_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path}"
        try:
            r = requests.get(download_url, timeout=30)
            if r.status_code == 200:
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                with open(dest_path, "wb") as f:
                    f.write(r.content)
                return dest_path
        except Exception as e:
            print("[File Download Error]:", e)
    return None

def start_quote_wizard(chat_id: int):
    QUOTE_SESSIONS[chat_id] = {
        "step": "studio_name",
        "studio_name": "",
        "logo_path": None,
        "client_name": "",
        "project_title": "",
        "amount": "150,000",
        "currency": "₦",
        "items": [],
        "terms": "50% upfront deposit to commence. 50% upon final deliverable review. Turnaround: 5-7 business days."
    }
    msg_text = (
        "🧾 <b>Quotation &amp; Receipt Slip Generator (Chat Mode)</b>\n\n"
        "Let's build your luxury quotation slip right here in chat!\n\n"
        "<b>Step 1 of 5:</b> What is your <b>Business or Studio Name</b>?\n"
        "<i>(e.g., Apex Creative Agency, TeeJay Graphics)</i>\n\n"
        "<i>Send /cancel at any time to exit.</i>"
    )
    send_msg(chat_id, msg_text)

def handle_quote_message(chat_id: int, msg: dict) -> bool:
    session = QUOTE_SESSIONS.get(chat_id)
    if not session:
        return False

    text = (msg.get("text") or "").strip()
    if text == "/cancel":
        QUOTE_SESSIONS.pop(chat_id, None)
        send_msg(chat_id, "❌ <b>Quote creation cancelled.</b> Send /quote anytime to start again.", build_main_menu_keyboard(True))
        return True

    step = session.get("step")

    # Step 1: Studio Name
    if step == "studio_name":
        if not text:
            send_msg(chat_id, "Please enter your business or studio name:")
            return True
        session["studio_name"] = text
        session["step"] = "logo"
        send_msg(
            chat_id,
            f"✅ Studio Name: <b>{text}</b>\n\n"
            "<b>Step 2 of 5:</b> Send your <b>Business Logo</b> as an image 🖼️.\n\n"
            "<i>(Or send <b>/skip</b> to use an automatic luxury monogram with your initials).</i>"
        )
        return True

    # Step 2: Logo
    elif step == "logo":
        if "photo" in msg:
            photos = msg["photo"]
            best_photo = photos[-1]  # Highest resolution
            file_id = best_photo["file_id"]
            local_logo = f"tmp_logos/logo_{chat_id}.png"
            downloaded = download_tg_file(file_id, local_logo)
            session["logo_path"] = downloaded
            send_msg(chat_id, "✅ <b>Logo attached!</b>")
        elif text == "/skip":
            session["logo_path"] = None
            send_msg(chat_id, "⏩ <b>Logo skipped.</b> We will generate a luxury monogram.")
        else:
            send_msg(chat_id, "Please send a photo of your logo, or type <b>/skip</b> to proceed:")
            return True

        session["step"] = "client_name"
        send_msg(
            chat_id,
            "<b>Step 3 of 5:</b> Who is the <b>Client's Name or Company</b>?\n"
            "<i>(e.g., HaulFlow Africa, Dr. Ibrahim Adeleke, Apex Logistics)</i>"
        )
        return True

    # Step 3: Client Name
    elif step == "client_name":
        if not text:
            send_msg(chat_id, "Please enter the client's name or company:")
            return True
        session["client_name"] = text
        session["step"] = "project_title"
        send_msg(
            chat_id,
            f"✅ Client: <b>{text}</b>\n\n"
            "<b>Step 4 of 5:</b> What is the <b>Project Scope or Title</b>?\n"
            "<i>(e.g., Brand Identity & Next.js Website, 3-Month VA Retainer)</i>"
        )
        return True

    # Step 4: Project Title
    elif step == "project_title":
        if not text:
            send_msg(chat_id, "Please enter the project title:")
            return True
        session["project_title"] = text
        session["step"] = "amount"
        send_msg(
            chat_id,
            f"✅ Project: <b>{text}</b>\n\n"
            "<b>Step 5 of 5:</b> What is the <b>Total Price / Amount</b>?\n"
            "<i>(e.g., ₦180,000 or $450 or £300 or 150000)</i>"
        )
        return True

    # Step 5: Amount
    elif step == "amount":
        if not text:
            send_msg(chat_id, "Please enter the amount:")
            return True
        currency, formatted_amt, num_val = parse_currency_and_amount(text)
        session["currency"] = currency
        session["amount"] = formatted_amt
        session["step"] = "choose_template"

        keyboard = {
            "inline_keyboard": [
                [
                    {"text": "🏢 Corporate Wave", "callback_data": "render_quote_corporate"},
                    {"text": "🎨 Modern Minimalist", "callback_data": "render_quote_minimalist"}
                ],
                [
                    {"text": "🍱 Bento Grid", "callback_data": "render_quote_bento"},
                    {"text": "🧾 Boutique Slip", "callback_data": "render_quote_classic-slip"}
                ],
                [
                    {"text": "❌ Cancel", "callback_data": "quote_cancel"}
                ]
            ]
        }

        summary_text = (
            "🎉 <b>All Details Captured!</b>\n\n"
            f"• <b>Studio:</b> {session['studio_name']}\n"
            f"• <b>Client:</b> {session['client_name']}\n"
            f"• <b>Project:</b> {session['project_title']}\n"
            f"• <b>Total:</b> {session['currency']}{session['amount']}\n\n"
            "👉 <b>Choose your receipt slip style to render the final picture:</b>"
        )
        send_msg(chat_id, summary_text, keyboard)
        return True

    return False

def build_main_menu_keyboard(is_vip: bool = True):
    mini_app_url = os.environ.get("MINI_APP_URL", "https://ophancer.vercel.app")
    return {
        "inline_keyboard": [
            [
                {"text": "📱 Open Ophancer App", "web_app": {"url": mini_app_url}}
            ],
            [
                {"text": "🧾 Create Quote (In Chat)", "callback_data": "start_new_quote"},
                {"text": "🎨 Web Quote Studio", "web_app": {"url": f"{mini_app_url}?page=quotemaker"}}
            ],
            [
                {"text": "🎯 Set Job Niche", "callback_data": "menu_cat"},
                {"text": "📍 Location Filter", "callback_data": "menu_loc"}
            ],
            [
                {"text": "🌟 Free VIP Alerts (Active)", "callback_data": "menu_vip_info"}
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

    welcome_text = (
        f"👋 <b>Welcome, {first_name or 'there'}!</b>\n\n"
        f"You are connected to <b>Ophancer Job &amp; Client Alert Radar</b>.\n"
        f"Whenever verified roles or client inquiries drop, our 5-minute hunting engine checks your preferences and alerts you directly.\n\n"
        f"🎁 <b>100% Free VIP Access Unlocked:</b> You receive instant personal pings as new roles match your niche!\n\n"
        f"📌 <b>Current Selected Niche:</b> {cat_label}\n"
        f"📍 <b>Location Preference:</b> {LOCATIONS.get(sub.get('location_pref', 'all'))}\n\n"
        f"<i>Tap below to open the Web App, create a quotation slip, or customize your alerts.</i>"
    )

    send_msg(chat_id, welcome_text, build_main_menu_keyboard(True))

def handle_settings(chat_id: int):
    sub = get_subscriber(chat_id)
    if not sub:
        return handle_start(chat_id, "", "Friend")

    cat_label = CATEGORIES.get(sub.get("category", "va"), "Virtual Assistant")
    loc_label = LOCATIONS.get(sub.get("location_pref", "all"), "All Locations")
    status_label = "🌟 Free VIP Member"

    mini_app_url = os.environ.get("MINI_APP_URL", "https://ophancer.vercel.app")
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
            [{"text": "🧾 Create Quote Slip", "web_app": {"url": f"{mini_app_url}?page=quotemaker"}}],
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

    elif data == "start_new_quote":
        start_quote_wizard(chat_id)

    elif data == "quote_cancel":
        QUOTE_SESSIONS.pop(chat_id, None)
        send_msg(chat_id, "❌ <b>Quotation creation cancelled.</b> Send /quote anytime to start again.", build_main_menu_keyboard(True))

    elif data == "choose_template_again":
        session = QUOTE_SESSIONS.get(chat_id)
        if session:
            keyboard = {
                "inline_keyboard": [
                    [
                        {"text": "🏢 Corporate Wave", "callback_data": "render_quote_corporate"},
                        {"text": "🎨 Modern Minimalist", "callback_data": "render_quote_minimalist"}
                    ],
                    [
                        {"text": "🍱 Bento Grid", "callback_data": "render_quote_bento"},
                        {"text": "🧾 Boutique Slip", "callback_data": "render_quote_classic-slip"}
                    ],
                    [
                        {"text": "❌ Cancel", "callback_data": "quote_cancel"}
                    ]
                ]
            }
            send_msg(chat_id, "👉 <b>Choose your receipt slip style:</b>", keyboard)
        else:
            send_msg(chat_id, "Send /quote to start a new quotation slip.")

    elif data.startswith("render_quote_"):
        template_id = data.replace("render_quote_", "")
        session = QUOTE_SESSIONS.get(chat_id)
        if not session:
            send_msg(chat_id, "⚠️ Your quote session expired. Send /quote to create a new quotation slip.", build_main_menu_keyboard(True))
            return

        send_msg(chat_id, "⏳ <i>Rendering your luxury quotation slip...</i>")
        try:
            quote_data = {
                "studio_name": session.get("studio_name") or "Creative Studio",
                "logo_path": session.get("logo_path"),
                "client_name": session.get("client_name") or "Valued Client",
                "project_title": session.get("project_title") or "Professional Services",
                "amount": session.get("amount") or "150,000",
                "currency": session.get("currency") or "₦",
                "terms": session.get("terms") or "50% upfront deposit to commence. 50% upon final deliverable review."
            }
            img_path = generate_quote_slip(template_id, quote_data)

            caption = (
                f"🧾 <b>Quotation Slip Ready!</b>\n\n"
                f"• <b>Studio:</b> {quote_data['studio_name']}\n"
                f"• <b>Client:</b> {quote_data['client_name']}\n"
                f"• <b>Project:</b> {quote_data['project_title']}\n"
                f"• <b>Total:</b> {quote_data['currency']}{quote_data['amount']}\n\n"
                f"✨ You can forward or save this picture directly to send to your client on WhatsApp or Telegram."
            )

            action_kb = {
                "inline_keyboard": [
                    [
                        {"text": "🔄 Change Template", "callback_data": "choose_template_again"},
                        {"text": "➕ Create Another", "callback_data": "start_new_quote"}
                    ]
                ]
            }
            send_photo(chat_id, img_path, caption=caption, reply_markup=action_kb)
        except Exception as e:
            print(f"[Render Quote Error]: {e}")
            send_msg(chat_id, f"⚠️ Error generating quote picture: {e}\nSend /quote to try again.")

    elif data in ["menu_buy_vip", "menu_vip_info"]:
        send_msg(chat_id, "🌟 <b>VIP Priority Radar is 100% Free!</b>\n\nYour account has full VIP access active with zero fees or Stars required. You will receive real-time direct lead alerts with tailored pitch angles.", build_main_menu_keyboard(True))

    elif data == "menu_settings":
        handle_settings(chat_id)

    elif data == "toggle_pause":
        sub = get_subscriber(chat_id) or {}
        new_active = not sub.get("is_active", True)
        update_pref(chat_id, "is_active", new_active)
        status_msg = "▶️ <b>Alerts Resumed!</b> You will receive matching jobs." if new_active else "⏸️ <b>Alerts Paused.</b> You will not receive pings until you resume."
        send_msg(chat_id, status_msg, build_main_menu_keyboard(True))

# ----------------- MAIN LONG-POLLING LOOP -----------------
def run_bot_service():
    print(f"🤖 [Ophancer Telegram VIP Bot] Started and listening for commands...")
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

                        text = msg.get("text", "").strip()

                        # First check if user is in an active quote creation wizard
                        if chat_id in QUOTE_SESSIONS:
                            if handle_quote_message(chat_id, msg):
                                continue

                        if text.startswith("/start"):
                            parts = text.split(" ")
                            param = parts[1] if len(parts) > 1 else ""
                            handle_start(chat_id, username, first_name, param)

                        elif text.startswith("/settings") or text.startswith("/keywords"):
                            handle_settings(chat_id)

                        elif text.startswith("/quote") or text.startswith("/invoice"):
                            start_quote_wizard(chat_id)

                        elif text.startswith("/vip") or text.startswith("/stars"):
                            send_msg(chat_id, "🌟 <b>VIP Priority Radar is 100% Free!</b>\n\nYour account has full priority VIP access unlocked with zero fees or Stars required.", build_main_menu_keyboard(True))

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
                                "/quote — Create a luxury quotation or receipt slip\n"
                                "/settings — Change niche (VA, Tech, Design) or location\n"
                                "/vip — View your Free VIP Radar status\n"
                                "/pause — Temporarily pause job alerts\n"
                                "/resume — Resume receiving job alerts\n\n"
                                "Need human help? WhatsApp: wa.me/2348025100844 (+234 802 510 0844)"
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
