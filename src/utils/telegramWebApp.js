/**
 * Telegram WebApp (TMA) Native SDK Integration
 * Provides zero-friction native integration when running inside Telegram
 * and graceful fallbacks when opened on regular desktop/mobile browsers.
 */

export function isTelegramWebApp() {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.Telegram &&
    window.Telegram.WebApp &&
    window.Telegram.WebApp.initData &&
    window.Telegram.WebApp.initData.length > 0
  );
}

export function getTelegramUser() {
  if (typeof window === 'undefined') return null;
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!user || !user.id) return null;
  return {
    id: user.id,
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    username: user.username || '',
    language_code: user.language_code || 'en',
    photo_url: user.photo_url || null,
    is_premium: Boolean(user.is_premium)
  };
}

export function initTelegramWebApp() {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) return;

  try {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    
    // Set native Telegram header & background colors (supported in v6.1+)
    if (tg.isVersionAtLeast && tg.isVersionAtLeast('6.1')) {
      if (tg.setHeaderColor) {
        tg.setHeaderColor('#FFFFFF');
      }
      if (tg.setBackgroundColor) {
        tg.setBackgroundColor('#F8F9FE');
      }
    }
  } catch (err) {
    console.warn('[Telegram WebApp] Init notice:', err);
  }
}

export function telegramHaptic(type = 'light') {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.HapticFeedback) return;
  try {
    const haptic = window.Telegram.WebApp.HapticFeedback;
    if (['light', 'medium', 'heavy', 'rigid', 'soft'].includes(type)) {
      haptic.impactOccurred(type);
    } else if (['success', 'warning', 'error'].includes(type)) {
      haptic.notificationOccurred(type);
    }
  } catch (err) {
    // Ignore in unsupported environments
  }
}

export function openTelegramLink(url) {
  if (typeof window === 'undefined') return;
  if (window.Telegram?.WebApp?.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
