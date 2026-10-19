/**
 * textUtils.js - Unified text cleaner, HTML entity decoder, mojibake fixer,
 * budget sanitizer, and date formatter for Ophancer job & gig listings.
 */

export function cleanTextContent(text) {
  if (!text || typeof text !== 'string') return '';
  let str = text;

  // 1. Decode standard and numeric HTML entities (two passes for double-encoded text)
  for (let i = 0; i < 2; i++) {
    str = str
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&#039;/g, "'")
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#8211;/g, '–')
      .replace(/&#8212;/g, '—')
      .replace(/&rsquo;/gi, "'")
      .replace(/&lsquo;/gi, "'")
      .replace(/&rdquo;/gi, '"')
      .replace(/&ldquo;/gi, '"')
      .replace(/&mdash;/gi, '—')
      .replace(/&ndash;/gi, '–')
      .replace(/&nbsp;/gi, ' ');
  }

  // 2. Strip any remaining HTML tags (like <p>, <span>, <br>, <div>, etc.)
  str = str.replace(/<[^>]+>/g, ' ');

  // 3. Fix common Latin-1 / UTF-8 Mojibake artifacts
  str = str
    .replace(/\u00C2\s*/g, ' ')           // Â followed by space or alone
    .replace(/\u00C2/g, '')               // Stray Â
    .replace(/\u00E2\u20AC\u2122/g, "'")   // â€™ -> '
    .replace(/\u00E2\u20AC\u02DC/g, "'")   // â€˜ -> '
    .replace(/\u00E2\u20AC\u0153/g, '"')   // â€œ -> "
    .replace(/\u00E2\u20AC\u009D/g, '"')   // â€ -> "
    .replace(/\u00E2\u20AC\u201D/g, '—')   // â€” -> —
    .replace(/\u00E2\u20AC\u2013/g, '–')   // â€“ -> –
    .replace(/\u00E2\u20AC\u00A6/g, '…')   // â€¦ -> …
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€\s*/g, '"')
    .replace(/â€”/g, '—')
    .replace(/â€“/g, '–')
    .replace(/â€¦/g, '…')
    .replace(/âre\b/gi, "'re")
    .replace(/âs\b/gi, "'s")
    .replace(/âve\b/gi, "'ve")
    .replace(/âll\b/gi, "'ll")
    .replace(/âd\b/gi, "'d")
    .replace(/â\b/g, "'")
    .replace(/Ã©/g, 'é')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã¼/g, 'ü')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã¤/g, 'ä')
    .replace(/ð[\x80-\xbf]*/g, ''); // strip broken emoji surrogates

  // 4. Collapse excess whitespace
  str = str.replace(/\s{2,}/g, ' ').trim();

  return str;
}

export function isEnglishOpportunity(item) {
  if (!item) return false;
  const title = (item.title || '').toLowerCase();
  const desc = (item.description || '').slice(0, 400).toLowerCase();
  const combined = `${title} ${desc}`;

  // 1. Cyrillic characters (Russian, Ukrainian, etc.)
  if (/[\u0400-\u04FF]/.test(combined)) return false;

  // 2. Explicit Spanish job postings
  if (/\b(es una plataforma|qu[eé] es|requisitos del puesto|desarrollador|experiencia previa|enviar cv|puesto de trabajo|habilidades requeridas)\b/i.test(combined)) {
    return false;
  }

  // 3. Explicit German job postings
  if (/\b(f[uü]r unser|wir suchen|stellenangebot|erfahrung als|telefondienst f[uü]r|deine aufgaben|unser team)\b/i.test(combined)) {
    return false;
  }

  // 4. Explicit French job postings
  if (/\b(pour notre|nous recherchons|dans une|exp[eé]rience requise|poste de|candidature)\b/i.test(combined)) {
    return false;
  }

  return true;
}

export function isPhysicalLaborGig(item) {
  if (!item) return false;
  const title = (item.title || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const text = `${title} ${desc}`;

  const physicalPatterns = [
    /\b(general laborer|laborers|manual labor|yard cleanup|yard work|debris removal|drywall|hauling|junk removal)\b/i,
    /\b(moving help|furniture moving|heavy lifting|warehouse loading|forklift operator)\b/i,
    /\b(house cleaner|house cleaning|maid service|in-person cleaner|housekeeper)\b/i,
    /\b(lawn care|landscaping|mowing lawn|snow shoveling|roofing repair)\b/i,
    /\b(handyman|plumbing repair|auto mechanic|car detailer)\b/i,
    /\b(babysitter|nanny needed|dog walker)\b/i
  ];

  return physicalPatterns.some(pattern => pattern.test(text));
}

export function sanitizeBudget(rawBudget, isClientGig = false) {
  if (!rawBudget || typeof rawBudget !== 'string') {
    return isClientGig ? 'Negotiable' : 'Competitive';
  }
  const clean = cleanTextContent(rawBudget);

  // Catch glitch numbers like "₦3", "$0", "3", "0", "₦1", "$5" without context
  if (/^[₦$£€]?\s*[0-9]{1,2}$/i.test(clean)) {
    return isClientGig ? 'Negotiable' : 'Competitive';
  }

  if (/^negotiable\s*(\/|or)\s*(competitive|discuss)/i.test(clean)) {
    return isClientGig ? 'Negotiable' : 'Competitive';
  }
  if (/^competitive\s*(\/|or)\s*(negotiable|disclosed)/i.test(clean)) {
    return 'Competitive';
  }
  if (clean.startsWith(',000') || clean.startsWith('000')) {
    return '$1,' + clean.replace(/^[,\s0]+/, '');
  }

  return clean;
}

export function formatDatePosted(dateValue) {
  if (!dateValue) return 'Recently added';
  try {
    const cleaned = String(dateValue).trim().replace(/\s+WAT/i, ' +01:00');
    const d = new Date(cleaned);
    if (isNaN(d.getTime())) return 'Recently added';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    
    // Future protection
    if (diffMs < 0) return 'Just now';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}w ago`;
    }

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently added';
  }
}
