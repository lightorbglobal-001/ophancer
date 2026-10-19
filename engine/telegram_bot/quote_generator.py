import os
import re
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont

def get_font(size: int, bold: bool = False, mono: bool = False):
    candidates = []
    if mono:
        candidates = [
            "C:/Windows/Fonts/consolab.ttf" if bold else "C:/Windows/Fonts/consola.ttf",
            "C:/Windows/Fonts/courbd.ttf" if bold else "C:/Windows/Fonts/cour.ttf",
            "arial.ttf"
        ]
    elif bold:
        candidates = [
            "C:/Windows/Fonts/segoeuib.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
            "C:/Windows/Fonts/calibrib.ttf",
            "arial.ttf"
        ]
    else:
        candidates = [
            "C:/Windows/Fonts/segoeui.ttf",
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/calibri.ttf",
            "arial.ttf"
        ]
    
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    try:
        return ImageFont.load_default(size=size)
    except Exception:
        return ImageFont.load_default()

def parse_currency_and_amount(raw_text: str):
    """
    Intelligently extracts currency symbol and formatted amount.
    Defaults to ₦ if no currency symbol found.
    """
    text = (raw_text or "").strip()
    currency = "₦"
    if "$" in text or "usd" in text.lower():
        currency = "$"
    elif "£" in text or "gbp" in text.lower():
        currency = "£"
    elif "€" in text or "eur" in text.lower():
        currency = "€"
    elif "₦" in text or "ngn" in text.lower() or "naira" in text.lower():
        currency = "₦"

    # Extract digits and decimals/commas
    clean_nums = re.findall(r"[\d,]+", text)
    if clean_nums:
        # Pick the largest or first valid number group
        main_num = clean_nums[0].replace(",", "")
        try:
            val = int(main_num)
            formatted = f"{val:,}"
            return currency, formatted, val
        except Exception:
            pass
    return currency, text.replace(currency, "").strip() or "150,000", 150000

def draw_rounded_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    x0, y0, x1, y1 = bbox
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

def render_corporate_template(data: dict, output_path: str):
    width, height = 1000, 1420
    im = Image.new("RGBA", (width, height), (248, 250, 252, 255))
    draw = ImageDraw.Draw(im)

    # Fonts
    font_brand = get_font(32, bold=True)
    font_badge = get_font(14, bold=True)
    font_title = get_font(26, bold=True)
    font_h2 = get_font(18, bold=True)
    font_body = get_font(16, bold=False)
    font_body_b = get_font(16, bold=True)
    font_small = get_font(13, bold=False)
    font_price_lg = get_font(42, bold=True, mono=True)
    font_mono = get_font(18, bold=True, mono=True)

    # Main Card container
    card_x0, card_y0, card_x1, card_y1 = 50, 40, 950, 1370
    draw_rounded_rect(draw, (card_x0, card_y0, card_x1, card_y1), 28, fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=2)

    # Header Banner (Deep Navy Gradient Simulation)
    header_h = 160
    draw_rounded_rect(draw, (card_x0, card_y0, card_x1, card_y0 + header_h), 28, fill=(14, 18, 27, 255))
    # Fill bottom corners of header so it seamlessly joins
    draw.rectangle([card_x0, card_y0 + header_h - 28, card_x1, card_y0 + header_h], fill=(14, 18, 27, 255))
    
    # Accent top border line
    draw.line([card_x0 + 40, card_y0 + 2, card_x1 - 40, card_y0 + 2], fill=(105, 98, 241, 255), width=4)

    # Studio Logo or Monogram
    logo_path = data.get("logo_path")
    logo_placed = False
    logo_size = 80
    logo_x, logo_y = card_x0 + 40, card_y0 + 40

    if logo_path and os.path.exists(logo_path):
        try:
            logo_img = Image.open(logo_path).convert("RGBA")
            logo_img.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
            # Create rounded mask
            mask = Image.new("L", logo_img.size, 0)
            mask_draw = ImageDraw.Draw(mask)
            mask_draw.rounded_rectangle([0, 0, logo_img.size[0], logo_img.size[1]], 16, fill=255)
            im.paste(logo_img, (logo_x, logo_y), mask)
            logo_placed = True
        except Exception as e:
            print("Logo load error:", e)

    if not logo_placed:
        # Draw Monogram Avatar
        studio_name = data.get("studio_name") or "Studio"
        initials = "".join([w[0] for w in studio_name.split()[:2]]).upper() or "OP"
        draw_rounded_rect(draw, (logo_x, logo_y, logo_x + logo_size, logo_y + logo_size), 20, fill=(105, 98, 241, 255))
        draw.text((logo_x + 22, logo_y + 22), initials, fill=(255, 255, 255, 255), font=get_font(28, bold=True))

    # Studio Name & Subtitle
    text_x = logo_x + logo_size + 24
    draw.text((text_x, logo_y + 8), data.get("studio_name", "Verified Studio"), fill=(255, 255, 255, 255), font=font_brand)
    draw.text((text_x, logo_y + 48), "CLIENT SERVICES & CONTRACT QUOTATION", fill=(165, 160, 255, 255), font=font_badge)

    # Top Right Badge
    draw_rounded_rect(draw, (card_x1 - 210, logo_y + 12, card_x1 - 40, logo_y + 46), 18, fill=(30, 36, 52, 255), outline=(105, 98, 241, 150), width=1)
    draw.ellipse([card_x1 - 195, logo_y + 25, card_x1 - 185, logo_y + 35], fill=(52, 211, 153, 255))
    draw.text((card_x1 - 175, logo_y + 20), "OFFICIAL QUOTE", fill=(255, 255, 255, 255), font=font_badge)

    # Info Strip (Client & Quote Details)
    info_y = card_y0 + header_h + 30
    draw_rounded_rect(draw, (card_x0 + 40, info_y, card_x1 - 40, info_y + 110), 18, fill=(248, 249, 254, 255), outline=(235, 239, 245, 255), width=1)

    # Client Info (Left)
    draw.text((card_x0 + 65, info_y + 20), "PREPARED FOR", fill=(148, 163, 184, 255), font=get_font(12, bold=True))
    draw.text((card_x0 + 65, info_y + 42), data.get("client_name", "Valued Client"), fill=(14, 18, 27, 255), font=font_title)
    draw.text((card_x0 + 65, info_y + 78), f"Project: {data.get('project_title', 'General Services')}", fill=(100, 116, 139, 255), font=font_body)

    # Quote Meta (Right)
    today_str = datetime.now().strftime("%d %b %Y")
    q_num = data.get("quote_number", f"#OPH-{int(datetime.now().timestamp()) % 100000}")
    meta_x = card_x1 - 280
    draw.text((meta_x, info_y + 22), "QUOTE NO:", fill=(148, 163, 184, 255), font=get_font(12, bold=True))
    draw.text((meta_x + 90, info_y + 20), q_num, fill=(14, 18, 27, 255), font=font_body_b)
    
    draw.text((meta_x, info_y + 48), "ISSUE DATE:", fill=(148, 163, 184, 255), font=get_font(12, bold=True))
    draw.text((meta_x + 90, info_y + 48), today_str, fill=(71, 85, 105, 255), font=font_body)

    draw.text((meta_x, info_y + 74), "VALIDITY:", fill=(148, 163, 184, 255), font=get_font(12, bold=True))
    draw.text((meta_x + 90, info_y + 74), "14 Days", fill=(16, 185, 129, 255), font=font_body_b)

    # Deliverables Table Header
    table_y = info_y + 140
    draw_rounded_rect(draw, (card_x0 + 40, table_y, card_x1 - 40, table_y + 42), 12, fill=(14, 18, 27, 255))
    draw.text((card_x0 + 65, table_y + 12), "DELIVERABLE / SERVICE BREAKDOWN", fill=(255, 255, 255, 255), font=get_font(13, bold=True))
    draw.text((card_x1 - 160, table_y + 12), "AMOUNT", fill=(255, 255, 255, 255), font=get_font(13, bold=True))

    # Deliverable Rows
    items = data.get("items", [])
    if not items:
        items = [{
            "title": data.get("project_title", "Professional Scope of Work"),
            "description": "Full end-to-end milestone execution as agreed with client",
            "price": data.get("amount", "150,000")
        }]

    curr_y = table_y + 54
    currency = data.get("currency", "₦")

    for i, itm in enumerate(items[:4]):
        row_h = 76
        # Background alternating
        if i % 2 == 1:
            draw_rounded_rect(draw, (card_x0 + 40, curr_y - 6, card_x1 - 40, curr_y + row_h - 6), 10, fill=(248, 250, 252, 255))
        
        # Item Title & Description
        draw.text((card_x0 + 65, curr_y), f"{i+1}. {itm.get('title', 'Service Item')}", fill=(14, 18, 27, 255), font=font_h2)
        desc = itm.get('description', '')
        if desc:
            draw.text((card_x0 + 85, curr_y + 28), desc[:70] + ('...' if len(desc) > 70 else ''), fill=(100, 116, 139, 255), font=font_small)

        # Price
        p_val = str(itm.get('price', data.get('amount', '0')))
        if not p_val.startswith(currency):
            p_val = f"{currency}{p_val}"
        draw.text((card_x1 - 180, curr_y + 8), p_val, fill=(14, 18, 27, 255), font=font_mono)

        # Subtle divider
        draw.line([card_x0 + 60, curr_y + row_h - 6, card_x1 - 60, curr_y + row_h - 6], fill=(235, 240, 248, 255), width=1)
        curr_y += row_h

    # Total Box
    total_y = curr_y + 30
    draw_rounded_rect(draw, (card_x0 + 40, total_y, card_x1 - 40, total_y + 110), 20, fill=(244, 247, 254, 255), outline=(105, 98, 241, 120), width=2)
    
    draw.text((card_x0 + 70, total_y + 24), "TOTAL CONTRACT AMOUNT", fill=(105, 98, 241, 255), font=get_font(13, bold=True))
    draw.text((card_x0 + 70, total_y + 54), "All milestones included &bull; 0 Hidden charges", fill=(100, 116, 139, 255), font=font_small)

    total_amount_str = f"{currency}{data.get('amount', '150,000')}"
    draw.text((card_x1 - 320, total_y + 32), total_amount_str, fill=(14, 18, 27, 255), font=font_price_lg)

    # Terms & Turnaround Capsule
    terms_y = total_y + 130
    draw_rounded_rect(draw, (card_x0 + 40, terms_y, card_x1 - 40, terms_y + 90), 16, fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=1)
    draw.text((card_x0 + 65, terms_y + 16), "PAYMENT TERMS & TURNAROUND", fill=(14, 18, 27, 255), font=get_font(13, bold=True))
    terms_text = data.get("terms") or "50% upfront deposit to commence. 50% upon final deliverable review. Turnaround: 5-7 business days."
    draw.text((card_x0 + 65, terms_y + 44), terms_text[:95], fill=(71, 85, 105, 255), font=font_small)

    # Signature & Watermark Footer
    footer_y = card_y1 - 65
    draw.line([card_x0 + 40, footer_y - 15, card_x1 - 40, footer_y - 15], fill=(241, 245, 249, 255), width=1)
    draw.text((card_x0 + 65, footer_y), "Authorized Digital Quotation &bull; Ophancer Studio Engine", fill=(148, 163, 184, 255), font=font_small)
    draw.text((card_x1 - 250, footer_y), "🔒 SECURE PROPOSAL", fill=(16, 185, 129, 255), font=get_font(12, bold=True))

    im.convert("RGB").save(output_path, "PNG", quality=95)
    return output_path

def render_minimalist_template(data: dict, output_path: str):
    width, height = 1000, 1420
    im = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(im)

    font_brand = get_font(38, bold=True)
    font_badge = get_font(14, bold=True)
    font_title = get_font(28, bold=True)
    font_h2 = get_font(18, bold=True)
    font_body = get_font(16, bold=False)
    font_body_b = get_font(16, bold=True)
    font_small = get_font(13, bold=False)
    font_price_lg = get_font(46, bold=True, mono=True)
    font_mono = get_font(18, bold=True, mono=True)

    # Thin Outer Frame
    draw.rectangle([40, 40, 960, 1380], outline=(15, 23, 42, 255), width=2)
    draw.rectangle([46, 46, 954, 1374], outline=(241, 245, 249, 255), width=1)

    # Header
    draw.text((80, 80), data.get("studio_name", "STUDIO PROPOSAL").upper(), fill=(15, 23, 42, 255), font=font_brand)
    draw.text((80, 135), "PROJECT QUOTATION & SPECIFICATIONS", fill=(100, 116, 139, 255), font=font_badge)

    draw.text((700, 85), "QUOTATION", fill=(15, 23, 42, 255), font=get_font(22, bold=True))
    draw.text((700, 125), data.get("quote_number", "#OPH-9021"), fill=(100, 116, 139, 255), font=font_mono)

    draw.line([80, 175, 920, 175], fill=(15, 23, 42, 255), width=2)

    # Client Section
    draw.text((80, 205), "CLIENT / ORGANIZATION", fill=(148, 163, 184, 255), font=font_badge)
    draw.text((80, 230), data.get("client_name", "Direct Client"), fill=(15, 23, 42, 255), font=font_title)
    
    draw.text((550, 205), "PROJECT TITLE", fill=(148, 163, 184, 255), font=font_badge)
    draw.text((550, 230), data.get("project_title", "Custom Scope"), fill=(15, 23, 42, 255), font=font_h2)

    draw.line([80, 290, 920, 290], fill=(226, 232, 240, 255), width=1)

    # Deliverables
    draw.text((80, 320), "SCOPE OF DELIVERABLES", fill=(148, 163, 184, 255), font=font_badge)
    draw.text((820, 320), "FEE", fill=(148, 163, 184, 255), font=font_badge)

    items = data.get("items", [])
    if not items:
        items = [{
            "title": data.get("project_title", "Full Project Delivery"),
            "description": "Milestone design and engineering execution",
            "price": data.get("amount", "150,000")
        }]

    curr_y = 360
    currency = data.get("currency", "₦")
    for i, itm in enumerate(items[:4]):
        draw.text((80, curr_y), f"— {itm.get('title', 'Service Deliverable')}", fill=(15, 23, 42, 255), font=font_h2)
        desc = itm.get('description', '')
        if desc:
            draw.text((105, curr_y + 26), desc[:70], fill=(100, 116, 139, 255), font=font_small)

        p_val = str(itm.get('price', data.get('amount', '0')))
        if not p_val.startswith(currency):
            p_val = f"{currency}{p_val}"
        draw.text((780, curr_y + 4), p_val, fill=(15, 23, 42, 255), font=font_mono)

        draw.line([80, curr_y + 70, 920, curr_y + 70], fill=(241, 245, 249, 255), width=1)
        curr_y += 85

    # Total Section
    curr_y += 30
    draw.line([80, curr_y, 920, curr_y], fill=(15, 23, 42, 255), width=2)
    draw.text((80, curr_y + 20), "TOTAL ESTIMATE", fill=(15, 23, 42, 255), font=font_badge)
    
    total_str = f"{currency}{data.get('amount', '150,000')}"
    draw.text((680, curr_y + 10), total_str, fill=(15, 23, 42, 255), font=font_price_lg)

    # Terms
    terms_y = curr_y + 90
    draw.text((80, terms_y), "TERMS:", fill=(148, 163, 184, 255), font=font_badge)
    terms_text = data.get("terms") or "50% deposit to commence. 50% on final approval. Delivery within 5 business days."
    draw.text((140, terms_y), terms_text[:85], fill=(71, 85, 105, 255), font=font_small)

    im.convert("RGB").save(output_path, "PNG", quality=95)
    return output_path

def render_bento_template(data: dict, output_path: str):
    # Bento Grid Style: Modular cards on deep slate canvas
    width, height = 1000, 1420
    im = Image.new("RGBA", (width, height), (14, 18, 27, 255))
    draw = ImageDraw.Draw(im)

    font_brand = get_font(32, bold=True)
    font_badge = get_font(13, bold=True)
    font_title = get_font(26, bold=True)
    font_h2 = get_font(18, bold=True)
    font_body = get_font(15, bold=False)
    font_small = get_font(13, bold=False)
    font_price_lg = get_font(46, bold=True, mono=True)
    font_mono = get_font(18, bold=True, mono=True)

    currency = data.get("currency", "₦")

    # Card 1: Studio Identity (Top Full Width)
    draw_rounded_rect(draw, (50, 40, 950, 180), 24, fill=(24, 30, 44, 255), outline=(42, 50, 70, 255), width=1)
    
    # Monogram or Logo
    draw_rounded_rect(draw, (80, 65, 170, 155), 18, fill=(105, 98, 241, 255))
    initials = "".join([w[0] for w in (data.get("studio_name") or "OP").split()[:2]]).upper()
    draw.text((105, 90), initials, fill=(255, 255, 255, 255), font=get_font(32, bold=True))

    draw.text((195, 75), data.get("studio_name", "Creative Studio"), fill=(255, 255, 255, 255), font=font_brand)
    draw.text((195, 120), "VERIFIED CLIENT QUOTATION &bull; BENTO SLIP", fill=(165, 160, 255, 255), font=font_badge)

    draw_rounded_rect(draw, (770, 80, 920, 120), 16, fill=(105, 98, 241, 40), outline=(105, 98, 241, 150), width=1)
    draw.text((795, 90), "OFFICIAL", fill=(165, 160, 255, 255), font=font_badge)

    # Card 2 (Left): Client & Date Card
    draw_rounded_rect(draw, (50, 205, 485, 395), 24, fill=(24, 30, 44, 255), outline=(42, 50, 70, 255), width=1)
    draw.text((80, 230), "PREPARED FOR", fill=(148, 163, 184, 255), font=font_badge)
    draw.text((80, 260), data.get("client_name", "Client"), fill=(255, 255, 255, 255), font=font_title)
    draw.text((80, 310), f"Date: {datetime.now().strftime('%d %b %Y')}", fill=(148, 163, 184, 255), font=font_body)
    draw.text((80, 340), f"Quote: {data.get('quote_number', '#OPH-8921')}", fill=(105, 98, 241, 255), font=font_body)

    # Card 3 (Right): Project Title Card
    draw_rounded_rect(draw, (515, 205, 950, 395), 24, fill=(24, 30, 44, 255), outline=(42, 50, 70, 255), width=1)
    draw.text((545, 230), "PROJECT FOCUS", fill=(148, 163, 184, 255), font=font_badge)
    draw.text((545, 260), data.get("project_title", "Design & Code"), fill=(255, 255, 255, 255), font=font_title)
    draw.text((545, 310), "Status: 🟢 Confirmed Quote", fill=(52, 211, 153, 255), font=font_body)
    draw.text((545, 340), "Turnaround: 5 business days", fill=(148, 163, 184, 255), font=font_body)

    # Card 4: Deliverables Table
    draw_rounded_rect(draw, (50, 420, 950, 890), 24, fill=(24, 30, 44, 255), outline=(42, 50, 70, 255), width=1)
    draw.text((80, 445), "MILESTONES & DELIVERABLES", fill=(148, 163, 184, 255), font=font_badge)
    
    items = data.get("items", [])
    if not items:
        items = [{
            "title": data.get("project_title", "Full Project Delivery"),
            "description": "Milestone design and engineering execution",
            "price": data.get("amount", "150,000")
        }]

    curr_y = 490
    for i, itm in enumerate(items[:4]):
        draw_rounded_rect(draw, (75, curr_y, 925, curr_y + 80), 16, fill=(30, 38, 56, 255))
        draw.text((100, curr_y + 16), f"{i+1}. {itm.get('title', 'Deliverable')}", fill=(255, 255, 255, 255), font=font_h2)
        desc = itm.get('description', '')
        if desc:
            draw.text((120, curr_y + 44), desc[:65], fill=(148, 163, 184, 255), font=font_small)

        p_val = str(itm.get('price', data.get('amount', '0')))
        if not p_val.startswith(currency):
            p_val = f"{currency}{p_val}"
        draw.text((790, curr_y + 24), p_val, fill=(52, 211, 153, 255), font=font_mono)
        curr_y += 95

    # Card 5: Grand Total Banner
    draw_rounded_rect(draw, (50, 915, 950, 1070), 24, fill=(105, 98, 241, 255))
    draw.text((85, 945), "TOTAL ESTIMATED AMOUNT", fill=(224, 220, 255, 255), font=font_badge)
    draw.text((85, 980), "All taxes & scope included", fill=(200, 195, 255, 255), font=font_small)
    
    total_str = f"{currency}{data.get('amount', '150,000')}"
    draw.text((640, 960), total_str, fill=(255, 255, 255, 255), font=font_price_lg)

    # Card 6: Payment Terms
    draw_rounded_rect(draw, (50, 1095, 950, 1240), 24, fill=(24, 30, 44, 255), outline=(42, 50, 70, 255), width=1)
    draw.text((80, 1120), "TERMS & CONDITIONS", fill=(148, 163, 184, 255), font=font_badge)
    terms_text = data.get("terms") or "50% upfront deposit to commence. 50% upon final delivery review. Turnaround: 5-7 business days."
    draw.text((80, 1155), terms_text[:95], fill=(226, 232, 240, 255), font=font_body)

    # Footer
    draw.text((80, 1310), "Powered by Ophancer Studio &bull; Verified Digital Quotation", fill=(100, 116, 139, 255), font=font_small)

    im.convert("RGB").save(output_path, "PNG", quality=95)
    return output_path

def render_classic_slip_template(data: dict, output_path: str):
    # Luxury Boutique Slip
    width, height = 1000, 1420
    im = Image.new("RGBA", (width, height), (245, 247, 250, 255))
    draw = ImageDraw.Draw(im)

    font_brand = get_font(34, bold=True)
    font_badge = get_font(13, bold=True)
    font_title = get_font(24, bold=True)
    font_h2 = get_font(17, bold=True)
    font_body = get_font(15, bold=False)
    font_small = get_font(13, bold=False)
    font_price_lg = get_font(42, bold=True, mono=True)
    font_mono = get_font(17, bold=True, mono=True)

    currency = data.get("currency", "₦")

    # Vertical Slip Container
    slip_x0, slip_y0, slip_x1, slip_y1 = 80, 40, 920, 1380
    draw.rectangle([slip_x0, slip_y0, slip_x1, slip_y1], fill=(255, 255, 255, 255), outline=(203, 213, 225, 255), width=2)

    # Top Perforated Receipt Header
    draw.text((slip_x0 + 40, slip_y0 + 40), data.get("studio_name", "STUDIO SLIP").upper(), fill=(15, 23, 42, 255), font=font_brand)
    draw.text((slip_x0 + 40, slip_y0 + 85), "DIGITAL RECEIPT &bull; QUOTATION ORDER", fill=(100, 116, 139, 255), font=font_badge)

    draw.text((slip_x1 - 220, slip_y0 + 45), data.get("quote_number", "#OPH-0182"), fill=(15, 23, 42, 255), font=font_mono)
    draw.text((slip_x1 - 220, slip_y0 + 85), datetime.now().strftime("%d %b %Y"), fill=(100, 116, 139, 255), font=font_small)

    # Dotted divider line
    for x in range(slip_x0 + 40, slip_x1 - 40, 14):
        draw.line([x, slip_y0 + 125, x + 7, slip_y0 + 125], fill=(148, 163, 184, 255), width=2)

    # Client Info
    draw.text((slip_x0 + 40, slip_y0 + 150), "CLIENT:", fill=(148, 163, 184, 255), font=font_badge)
    draw.text((slip_x0 + 110, slip_y0 + 148), data.get("client_name", "Valued Client"), fill=(15, 23, 42, 255), font=font_title)

    draw.text((slip_x0 + 40, slip_y0 + 190), "PROJECT:", fill=(148, 163, 184, 255), font=font_badge)
    draw.text((slip_x0 + 110, slip_y0 + 190), data.get("project_title", "Scope Deliverables"), fill=(71, 85, 105, 255), font=font_h2)

    for x in range(slip_x0 + 40, slip_x1 - 40, 14):
        draw.line([x, slip_y0 + 235, x + 7, slip_y0 + 235], fill=(148, 163, 184, 255), width=2)

    # Table items
    items = data.get("items", [])
    if not items:
        items = [{
            "title": data.get("project_title", "Full Project Delivery"),
            "description": "Milestone design and engineering execution",
            "price": data.get("amount", "150,000")
        }]

    curr_y = slip_y0 + 265
    for i, itm in enumerate(items[:4]):
        draw.text((slip_x0 + 40, curr_y), f"[{i+1}] {itm.get('title', 'Service Item')}", fill=(15, 23, 42, 255), font=font_h2)
        desc = itm.get('description', '')
        if desc:
            draw.text((slip_x0 + 65, curr_y + 28), desc[:70], fill=(100, 116, 139, 255), font=font_small)

        p_val = str(itm.get('price', data.get('amount', '0')))
        if not p_val.startswith(currency):
            p_val = f"{currency}{p_val}"
        draw.text((slip_x1 - 180, curr_y + 6), p_val, fill=(15, 23, 42, 255), font=font_mono)

        curr_y += 75

    # Dotted divider line
    for x in range(slip_x0 + 40, slip_x1 - 40, 14):
        draw.line([x, curr_y + 15, x + 7, curr_y + 15], fill=(148, 163, 184, 255), width=2)

    # Subtotal & Total
    curr_y += 45
    draw.text((slip_x0 + 40, curr_y), "SUBTOTAL", fill=(100, 116, 139, 255), font=font_badge)
    total_str = f"{currency}{data.get('amount', '150,000')}"
    draw.text((slip_x1 - 180, curr_y - 2), total_str, fill=(71, 85, 105, 255), font=font_mono)

    curr_y += 45
    draw.text((slip_x0 + 40, curr_y + 8), "TOTAL ESTIMATE", fill=(15, 23, 42, 255), font=get_font(18, bold=True))
    draw.text((slip_x1 - 280, curr_y), total_str, fill=(14, 18, 27, 255), font=font_price_lg)

    for x in range(slip_x0 + 40, slip_x1 - 40, 14):
        draw.line([x, curr_y + 75, x + 7, curr_y + 75], fill=(148, 163, 184, 255), width=2)

    # Terms
    curr_y += 105
    draw.text((slip_x0 + 40, curr_y), "TERMS & CONDITIONS", fill=(100, 116, 139, 255), font=font_badge)
    terms_text = data.get("terms") or "50% upfront deposit to commence. 50% upon final delivery review. Turnaround: 5-7 business days."
    draw.text((slip_x0 + 40, curr_y + 30), terms_text[:85], fill=(71, 85, 105, 255), font=font_small)

    # Simulated Barcode at bottom
    curr_y += 90
    draw.text((slip_x0 + 40, curr_y), "VERIFICATION HASH: 8492-OPH-2026", fill=(148, 163, 184, 255), font=font_small)
    barcode_x = slip_x0 + 40
    import random
    random.seed(42)
    for _ in range(50):
        w = random.choice([2, 4, 6, 8])
        draw.rectangle([barcode_x, curr_y + 25, barcode_x + w, curr_y + 65], fill=(15, 23, 42, 255))
        barcode_x += w + random.choice([3, 5, 7])
        if barcode_x > slip_x1 - 40:
            break

    im.convert("RGB").save(output_path, "PNG", quality=95)
    return output_path

def generate_quote_slip(template_id: str, data: dict, output_dir: str = "tmp_quotes") -> str:
    """
    Renders quote image and returns the absolute path of the generated PNG file.
    """
    os.makedirs(output_dir, exist_ok=True)
    filename = f"quote_{int(datetime.now().timestamp())}_{template_id}.png"
    output_path = os.path.join(output_dir, filename)

    if template_id == "minimalist":
        return render_minimalist_template(data, output_path)
    elif template_id == "bento":
        return render_bento_template(data, output_path)
    elif template_id == "classic-slip":
        return render_classic_slip_template(data, output_path)
    else: # corporate default
        return render_corporate_template(data, output_path)
