const LANGUAGE_KEY = 'app_language';

const localeByLanguage: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
};

const getActiveLocale = (): string => {
  if (typeof window === 'undefined') {
    return localeByLanguage.en;
  }

  const selectedLanguage = window.localStorage.getItem(LANGUAGE_KEY) || 'en';
  return localeByLanguage[selectedLanguage] || localeByLanguage.en;
};

export const formatCurrency = (amount: number, decimals = 2): string => {
  return amount.toLocaleString(getActiveLocale(), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString(getActiveLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString(getActiveLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export const formatCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const todayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};
