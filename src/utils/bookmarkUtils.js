/**
 * Unified Bookmark Utility for Ophancer
 * Handles opportunity identification, matching, and toggling across all formats
 * (UUIDs, numerical IDs, source_identifiers, slugs, and titles).
 */

/**
 * Extracts all unique identifiable strings for an opportunity.
 */
export function getOpportunityIdentifiers(opp) {
  if (!opp) return [];
  const ids = [
    opp.id,
    opp.source_identifier,
    opp.slug,
    opp.title,
    opp.source_url
  ].filter(val => val !== undefined && val !== null && String(val).trim() !== '');
  
  return Array.from(new Set(ids.map(val => String(val).trim())));
}

/**
 * Returns true if an opportunity matches any bookmark in the bookmarks list.
 */
export function isOpportunityBookmarked(opp, bookmarks = []) {
  if (!opp || !Array.isArray(bookmarks) || bookmarks.length === 0) return false;
  const oppIds = getOpportunityIdentifiers(opp);
  const bookmarkSet = new Set(bookmarks.map(b => String(b).trim()));
  return oppIds.some(id => bookmarkSet.has(id));
}

/**
 * Gets the primary unique identifier to store in bookmarks.
 */
export function getPrimaryBookmarkId(opp) {
  if (!opp) return null;
  if (typeof opp === 'string') return opp.trim();
  const primary = opp.id || opp.source_identifier || opp.slug || opp.title;
  return primary ? String(primary).trim() : null;
}

/**
 * Toggles a bookmark in an array of bookmark strings.
 * Automatically cleans up all associated aliases of an opportunity.
 */
export function toggleBookmarkInList(prevBookmarks = [], oppOrId) {
  if (!oppOrId) return prevBookmarks;
  
  if (typeof oppOrId === 'object') {
    const opp = oppOrId;
    const oppIds = getOpportunityIdentifiers(opp);
    const isCurrentlySaved = prevBookmarks.some(b => oppIds.includes(String(b).trim()));
    
    if (isCurrentlySaved) {
      // Remove all matching identifiers from bookmarks
      return prevBookmarks.filter(b => !oppIds.includes(String(b).trim()));
    } else {
      // Save primary identifier
      const primary = getPrimaryBookmarkId(opp);
      return primary ? [...prevBookmarks, primary] : prevBookmarks;
    }
  }

  // String / scalar identifier
  const idStr = String(oppOrId).trim();
  const exists = prevBookmarks.some(b => String(b).trim() === idStr);
  return exists 
    ? prevBookmarks.filter(b => String(b).trim() !== idStr)
    : [...prevBookmarks, idStr];
}
