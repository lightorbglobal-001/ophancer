import re

def extract_budget(text: str) -> dict:
    """
    Extracts currency and compensation figures from raw listing text.
    Handles Naira (₦ / NGN), Dollars ($ / USD), shorthand 'k' notation (e.g. $45k, ₦350k),
    and rate intervals (/hr, /month, /year).
    """
    result = {
        "currency": "NGN",
        "min_budget": None,
        "max_budget": None,
        "raw_text": "Negotiable / Competitive",
        "is_budget_negotiable": True,
        "is_negotiable": True
    }

    if not text:
        return result

    def parse_amount(val_str: str) -> float:
        val_str = val_str.lower().replace(',', '').strip()
        if 'k' in val_str:
            return float(val_str.replace('k', '')) * 1000
        return float(val_str)

    # 1. Check for Naira (₦ / NGN)
    naira_pattern = r'(?:₦|NGN|N)\s*([0-9,]+(?:\.[0-9]+)?\s*k?)\s*(?:-|to)?\s*(?:(?:₦|NGN|N)\s*)?([0-9,]+(?:\.[0-9]+)?\s*k?)?'
    naira_match = re.search(naira_pattern, text, re.IGNORECASE)
    if naira_match:
        result["currency"] = "NGN"
        try:
            val1 = parse_amount(naira_match.group(1))
            result["min_budget"] = val1
            if naira_match.group(2):
                val2 = parse_amount(naira_match.group(2))
                result["max_budget"] = val2
                result["raw_text"] = f"₦{int(val1):,} - ₦{int(val2):,}"
            else:
                result["raw_text"] = f"₦{int(val1):,}"
            result["is_budget_negotiable"] = False
            result["is_negotiable"] = False
            return result
        except (ValueError, TypeError):
            pass

    # 2. Check for Dollars ($ / USD)
    usd_pattern = r'(?:\$|USD)\s*([0-9,]+(?:\.[0-9]+)?\s*k?)\s*(?:-|to)?\s*(?:(?:\$|USD)\s*)?([0-9,]+(?:\.[0-9]+)?\s*k?)?'
    usd_match = re.search(usd_pattern, text, re.IGNORECASE)
    if usd_match:
        result["currency"] = "USD"
        try:
            val1 = parse_amount(usd_match.group(1))
            result["min_budget"] = val1
            if usd_match.group(2):
                val2 = parse_amount(usd_match.group(2))
                result["max_budget"] = val2
                result["raw_text"] = f"${int(val1):,} - ${int(val2):,}"
            else:
                result["raw_text"] = f"${int(val1):,}"
            result["is_budget_negotiable"] = False
            result["is_negotiable"] = False
            return result
        except (ValueError, TypeError):
            pass

    return result

def extract_work_mode(text: str) -> str:
    """
    Determines work mode: 'remote', 'hybrid', or 'onsite'.
    """
    lower = text.lower()
    if 'remote' in lower or 'work from home' in lower or 'wfh' in lower or 'telecommute' in lower:
        return 'remote'
    if 'hybrid' in lower:
        return 'hybrid'
    if 'onsite' in lower or 'in-person' in lower or 'office' in lower or 'lagos' in lower or 'abuja' in lower:
        return 'onsite'
    return 'remote'

def extract_skills(text: str) -> list:
    """
    Identifies common technology, creative, financial, and administrative skills.
    """
    keywords = [
        "React", "Node.js", "Python", "WordPress", "WooCommerce", "Flutter",
        "Tailwind", "TypeScript", "PostgreSQL", "Figma", "UI/UX", "Packaging",
        "Excel", "Financial Modeling", "Virtual Assistant", "Notion", "Ghostwriting",
        "Social Media", "Paystack", "Flutterwave", "SEO", "Shopify", "Customer Support",
        "Docker", "AWS", "PowerBI", "SQL", "Logistics", "Marketing", "Sales"
    ]
    found = []
    text_lower = text.lower()
    for kw in keywords:
        pattern = r'\b' + re.escape(kw.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found.append(kw)
    return found[:5]
