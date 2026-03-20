import i18n from './config';

/**
 * Format a date according to the current locale
 * @param {Date|string|number} date - The date to format
 * @param {string} format - 'long' or 'short' format
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'long') => {
  try {
    const locale = i18n.language === 'am' ? 'am-ET' : 'en-US';
    const options = format === 'long' 
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' };
    
    return new Date(date).toLocaleDateString(locale, options);
  } catch (error) {
    console.error('Date formatting error:', error);
    return String(date);
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - The past date
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  try {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);
    const diffMonths = Math.floor(diffMs / 2592000000);
    const diffYears = Math.floor(diffMs / 31536000000);
    
    if (diffMins < 1) return i18n.t('time.justNow');
    if (diffMins < 60) return i18n.t('time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return i18n.t('time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return i18n.t('time.daysAgo', { count: diffDays });
    if (diffWeeks < 4) return i18n.t('time.weeksAgo', { count: diffWeeks });
    if (diffMonths < 12) return i18n.t('time.monthsAgo', { count: diffMonths });
    return i18n.t('time.yearsAgo', { count: diffYears });
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return formatDate(date, 'short');
  }
};

/**
 * Format a number according to the current locale
 * @param {number} number - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  try {
    const locale = i18n.language === 'am' ? 'am-ET' : 'en-US';
    return new Intl.NumberFormat(locale).format(number);
  } catch (error) {
    console.error('Number formatting error:', error);
    return String(number);
  }
};

/**
 * Format currency (Ethiopian Birr)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  try {
    const locale = i18n.language === 'am' ? 'am-ET' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${amount} ETB`;
  }
};

/**
 * Translate dynamic content with fallback
 * @param {string} key - The translation key (without 'dynamic.' prefix)
 * @param {string} fallback - Fallback value if translation not found
 * @returns {string} Translated string or fallback
 */
export const translateDynamic = (key, fallback) => {
  try {
    const translated = i18n.t(`dynamic.${key}`, { defaultValue: null });
    
    if (!translated && process.env.NODE_ENV === 'development') {
      console.warn(`Missing dynamic translation: dynamic.${key}`);
    }
    
    return translated || fallback;
  } catch (error) {
    console.error('Dynamic translation error:', error);
    return fallback;
  }
};
