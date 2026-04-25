/* ═══════════════════════════════════════════════
   src/hooks/useCurrency.js
   
   Settings sayfasındaki "Default Currency" seçimini
   localStorage'dan okur ve tüm sayfalarda kullanılır.
   
   KULLANIM:
     import { useCurrency, fmtCurrency } from '../../hooks/useCurrency';
     
     // Bileşen içinde:
     const { symbol, currency } = useCurrency();
     
     // Bileşen dışında (utility):
     fmtCurrency(1234.56)  →  "₺1.234,56" veya "$1,234.56"
═══════════════════════════════════════════════ */
import { useState, useEffect } from 'react';

const SETTINGS_KEY = 'settings';

/* ── Symbol map ── */
export const CURRENCY_SYMBOL_MAP = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
};

/* ── Read currency from localStorage synchronously ── */
export function readCurrencySync() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return saved?.prefs?.currency || 'TRY';
  } catch {
    return 'TRY';
  }
}

export function readSymbolSync() {
  return CURRENCY_SYMBOL_MAP[readCurrencySync()] || '₺';
}

/* ── Format money with current currency symbol ── */
export function fmtCurrency(amount, digits = 2) {
  const sym = readSymbolSync();
  const abs = Math.abs(amount);
  return `${sym}${abs.toLocaleString('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

/* ── React hook — reaktif (Settings kaydettiğinde güncellenir) ── */
export function useCurrency() {
  const [currency, setCurrency] = useState(readCurrencySync);

  useEffect(() => {
    // Settings sayfası "settings" key'ini güncellediğinde yenile
    const onStorage = (e) => {
      if (e.key === SETTINGS_KEY) {
        setCurrency(readCurrencySync());
      }
    };
    // Aynı sekmedeki değişiklikler için custom event
    const onCustom = () => setCurrency(readCurrencySync());

    window.addEventListener('storage', onStorage);
    window.addEventListener('financeapp:settings_saved', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('financeapp:settings_saved', onCustom);
    };
  }, []);

  const symbol = CURRENCY_SYMBOL_MAP[currency] || '₺';

  const fmt = (amount, digits = 2) => {
    const abs = Math.abs(amount);
    return `${symbol}${abs.toLocaleString('tr-TR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })}`;
  };

  return { currency, symbol, fmt };
}
