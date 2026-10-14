import hashlib
import re
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

def normalize_url(url: str) -> str:
    """
    Strips tracking query parameters (utm_*, ref, source, fbclid, etc.)
    and normalizes domain for consistent deduplication.
    """
    if not url:
        return ""

    parsed = urlparse(url.strip())
    # Keep only non-tracking query parameters
    query_params = parse_qsl(parsed.query)
    clean_params = [
        (k, v) for k, v in query_params 
        if not k.lower().startswith(('utm_', 'ref', 'source', 'fbclid', 'gclid', 'mc_cid'))
    ]

    clean_query = urlencode(clean_params)
    normalized = urlunparse((
        parsed.scheme.lower(),
        parsed.netloc.lower(),
        parsed.path.rstrip('/'),
        parsed.params,
        clean_query,
        ''  # Remove fragments
    ))
    return normalized

def generate_opportunity_hash(title: str, company: str, source_url: str) -> str:
    """
    Generates a deterministic SHA256 identifier based on normalized metadata.
    """
    norm_title = re.sub(r'[^a-z0-9]', '', (title or "").lower())
    norm_company = re.sub(r'[^a-z0-9]', '', (company or "").lower())
    norm_url = normalize_url(source_url)

    composite_key = f"{norm_title}:{norm_company}:{norm_url}"
    return hashlib.sha256(composite_key.encode('utf-8')).hexdigest()
