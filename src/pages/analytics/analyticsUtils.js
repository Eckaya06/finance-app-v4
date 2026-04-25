/* ═══════════════════════════════════════════════
   analyticsUtils.js
   Hem ExchangePage hem AnalyticsPage bu dosyadan
   beslenir. Utility fonksiyonları buraya taşındı.
═══════════════════════════════════════════════ */

export const KEYS = {
  TRANSACTIONS : "financeapp_transactions",
  BUDGETS      : "financeapp_budgets",
  EXCHANGE_ENTRY: "financeapp_exchange_entry_v1",   // ExchangePage P&L entry
  FAV_CURRENCIES: "financeapp_favorite_currencies",
};

export const CURRENCY_SYMBOLS = {
  USD:"$", EUR:"€", GBP:"£", JPY:"¥",
  AUD:"A$", CAD:"C$", CHF:"Fr",
  GOLD:"Au", SILVER:"Ag",
};

/* ── temel sayı dönüşümü ── */
export const toNum = (v) => {
  const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/* ── para formatı ── */
export const fmtMoney = (n, digits = 2, currency = "₺") =>
  `${currency}${Math.abs(n).toLocaleString("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;

/* ── tarih kısaltma ── */
export const fmtShort = (iso) => {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

/* ── Transaction verisini oku ve hesapla ── */
export function readTransactionStats() {
  try {
    const tx = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || "[]");
    if (!Array.isArray(tx)) return emptyTxStats();

    const incomeTx  = tx.filter(t => (t.type||"").toLowerCase() === "income"  || toNum(t.amount) > 0);
    const expenseTx = tx.filter(t => (t.type||"").toLowerCase() === "expense" || toNum(t.amount) < 0);

    const totalIncome   = incomeTx .reduce((s,t) => s + Math.abs(toNum(t.amount)), 0);
    const totalExpenses = expenseTx.reduce((s,t) => s + Math.abs(toNum(t.amount)), 0);
    const netCash       = totalIncome - totalExpenses;

    /* harcama kategorileri */
    const catMap = new Map();
    for (const t of expenseTx) {
      const cat = (t.category || "Other").trim();
      catMap.set(cat, (catMap.get(cat) || 0) + Math.abs(toNum(t.amount)));
    }
    const spendingByCategory = Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    /* günlük cashflow serisi */
    const dayMap = new Map();
    for (const t of tx) {
      const date = String(t.date || t.transactionDate || t.createdAt || "").slice(0, 10);
      if (!date) continue;
      if (!dayMap.has(date)) dayMap.set(date, { date, income: 0, expense: 0 });
      const row   = dayMap.get(date);
      const isInc = (t.type||"").toLowerCase() === "income" || toNum(t.amount) > 0;
      const amt   = Math.abs(toNum(t.amount));
      if (isInc) row.income += amt; else row.expense += amt;
    }
    const cashflowSeries = Array.from(dayMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(r => ({ ...r, label: fmtShort(r.date), net: r.income - r.expense }));

    /* bütçeler */
    const budgets = JSON.parse(localStorage.getItem(KEYS.BUDGETS) || "[]");
    const budgetUsage = Array.isArray(budgets) ? budgets.map(b => {
      const cat   = (b.category || "Other").trim();
      const limit = toNum(b.maximum ?? b.max ?? b.limit ?? b.amount);
      const spent = expenseTx
        .filter(t => (t.category||"").trim() === cat)
        .reduce((s,t) => s + Math.abs(toNum(t.amount)), 0);
      const pct    = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
      const isOver = limit > 0 && spent > limit;
      return { category: cat, spent, limit, remaining: Math.max(0, limit - spent), pct, isOver };
    }) : [];

    return {
      totalIncome, totalExpenses, netCash,
      txCount: tx.length,
      savingsRate: totalIncome > 0 ? (netCash / totalIncome) * 100 : 0,
      spendingByCategory,
      cashflowSeries,
      budgetUsage,
    };
  } catch {
    return emptyTxStats();
  }
}

function emptyTxStats() {
  return {
    totalIncome: 0, totalExpenses: 0, netCash: 0,
    txCount: 0, savingsRate: 0,
    spendingByCategory: [], cashflowSeries: [], budgetUsage: [],
  };
}

/* ── Exchange P&L verisini oku ── */
export function readExchangePortfolio(liveRates = {}) {
  try {
    const entry = JSON.parse(localStorage.getItem(KEYS.EXCHANGE_ENTRY) || "null");
    if (!entry || typeof entry !== "object") return emptyPortfolio();

    const { cur, amount, rate: entryRate } = entry;
    if (!cur || !amount || !entryRate) return emptyPortfolio();

    const currentRate  = liveRates[cur] ?? entryRate;
    const entryValue   = amount * entryRate;        // TRY cinsinden giriş değeri
    const currentValue = amount * currentRate;      // TRY cinsinden şimdiki değer
    const pnlAbsolute  = currentValue - entryValue;
    const pnlPercent   = entryValue > 0 ? (pnlAbsolute / entryValue) * 100 : 0;

    return {
      hasPnl: true,
      currency: cur,
      amount,
      entryRate,
      currentRate,
      entryValue,
      currentValue,
      pnlAbsolute,
      pnlPercent,
    };
  } catch {
    return emptyPortfolio();
  }
}

function emptyPortfolio() {
  return {
    hasPnl: false,
    currency: null, amount: 0,
    entryRate: 0, currentRate: 0,
    entryValue: 0, currentValue: 0,
    pnlAbsolute: 0, pnlPercent: 0,
  };
}

/* ── Toplam Net Worth hesapla ── */
export function calcNetWorth(txStats, exchangePortfolio) {
  return txStats.netCash + (exchangePortfolio.hasPnl ? exchangePortfolio.currentValue : 0);
}
