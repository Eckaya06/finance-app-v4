import { useCallback, useEffect, useId, useMemo, useState } from "react";
import "./ExchangePage.css";
import { fetchMetalsGramTRY } from "../../services/metalsApi";

const API_BASE = "https://api.frankfurter.dev/v1";
const BASE = "TRY";

const ALL = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF"];

const LS_FAV_KEY   = "financeapp_favorite_currencies";
const LS_ENTRY_KEY = "financeapp_exchange_entry_v1";

const CURRENCY_META = {
  USD: { name: "United States Dollar", short: "US" },
  EUR: { name: "Euro",                 short: "EU" },
  GBP: { name: "British Pound",        short: "GB" },
  JPY: { name: "Japanese Yen",         short: "JP" },
  AUD: { name: "Australian Dollar",    short: "AU" },
  CAD: { name: "Canadian Dollar",      short: "CA" },
  CHF: { name: "Swiss Franc",          short: "CH" },
};

/* ── helpers ── */
const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
const toAmount = (v) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

function loadFavorites() {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_FAV_KEY) || "[]");
    return Array.isArray(arr) ? arr.filter((c) => ALL.includes(c)) : [];
  } catch (e) {
    console.warn("loadFavorites failed:", e); // DÜZELTME: sessiz yutma yerine warn
    return [];
  }
}
function saveFavorites(f) {
  try { localStorage.setItem(LS_FAV_KEY, JSON.stringify(f)); }
  catch (e) { console.warn("saveFavorites failed:", e); }
}

function loadEntry() {
  try {
    const obj = JSON.parse(localStorage.getItem(LS_ENTRY_KEY) || "null");
    if (!obj || typeof obj !== "object") return null;
    const { cur, amount, rate } = obj;
    if (!ALL.includes(cur))                                      return null;
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return null;
    if (!Number.isFinite(Number(rate))   || Number(rate)   <= 0) return null;
    return { cur, amount: Number(amount), rate: Number(rate) };
  } catch (e) {
    console.warn("loadEntry failed:", e); // DÜZELTME: sessiz yutma yerine warn
    return null;
  }
}
function saveEntry(e) {
  try {
    if (!e) localStorage.removeItem(LS_ENTRY_KEY);
    else    localStorage.setItem(LS_ENTRY_KEY, JSON.stringify(e));
  } catch (err) { console.warn("saveEntry failed:", err); }
}

function computeTrend(prev, cur) {
  const p = toNum(prev), c = toNum(cur);
  if (p === null || c === null || p <= 0) return null;
  const pct = ((c - p) / p) * 100;
  if (!Number.isFinite(pct)) return null;
  const dir = Math.abs(pct) < 0.01 ? "flat" : pct > 0 ? "up" : "down";
  return { pct, dir };
}

/* ── Mini Sparkline SVG ── */
// DÜZELTME: Math.random() → useId() ile sabit id, gradient artık kaybolmuyor
function Sparkline({ data = [], trend = "up", width = 80, height = 28 }) {
  const uid    = useId();
  const areaId = `area-${uid.replace(/:/g, "")}`;

  if (!data || data.length < 2) return null;
  const min   = Math.min(...data);
  const max   = Math.max(...data);
  const range = max - min || 1;
  const pad   = 2;
  const w     = width  - pad * 2;
  const h     = height - pad * 2;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  const pathD  = `M ${points.join(" L ")}`;
  const areaD  = `M ${points[0]} L ${points.join(" L ")} L ${pad + w},${pad + h} L ${pad},${pad + h} Z`;
  const color  = trend === "up" ? "#15803D" : trend === "down" ? "#B91C1C" : "#9CA3AF";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <defs>
        <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${areaId})`} />
      <path d={pathD} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── TrendBadge ── */
function TrendBadge({ trend, change }) {
  if (change === null || change === undefined) {
    return (
      <span className="ep-trend ep-trend--flat">
        <span className="ep-trend__dot" />
        <span>Live</span>
      </span>
    );
  }
  const dir   = trend === "up" ? "up" : trend === "down" ? "down" : "flat";
  const sign  = dir === "up" ? "+" : "";
  const arrow = dir === "up" ? "↑" : dir === "down" ? "↓" : "—";
  // DÜZELTME: NaN koruması eklendi
  const display = Number.isFinite(Number(change)) ? Number(change).toFixed(2) : "0.00";
  return (
    <span className={`ep-trend ep-trend--${dir}`}>
      <span className="ep-trend__icon">{arrow}</span>
      <span>{sign}{display}%</span>
    </span>
  );
}

/* ── CurrencyCard ── */
function CurrencyCard({
  code, name, badge, rate, prevRate,
  isMetal, isFav, onToggleFav,
  sparklineData,
  metalType, // "gold" | "silver" — replaces inline badgeStyle/codeStyle/rateStyle
  badgeStyle, codeStyle, rateStyle, cardStyle,
}) {
  const trend    = computeTrend(prevRate, rate);
  const trendDir = trend?.dir ?? "flat";
  const trendPct = trend?.pct ?? null;

  const metalClass = metalType ? ` ep-card--${metalType}` : "";

  return (
    <div className={`ep-card${isFav ? " ep-card--fav" : ""}${metalClass}`} style={cardStyle}>
      {/* header */}
      <div className="ep-card__head">
        <div className="ep-card__badge" style={badgeStyle}>{badge}</div>
        <div className="ep-card__meta">
          <span className="ep-card__code" style={codeStyle}>{code}</span>
          <span className="ep-card__name">{name}</span>
        </div>
        {onToggleFav && (
          <button
            type="button"
            className={`ep-card__star${isFav ? " ep-card__star--active" : ""}`}
            onClick={onToggleFav}
            aria-label={isFav ? `Remove ${code} from favorites` : `Add ${code} to favorites`}
          >
            {isFav ? "★" : "☆"}
          </button>
        )}
      </div>

      {/* rate row */}
      <div className="ep-card__rate-row">
        <div className="ep-card__rate">
          <span className="ep-card__value" style={rateStyle}>
            {rate != null ? Number(rate).toFixed(isMetal ? 2 : 4) : "—"}
          </span>
          <span className="ep-card__unit">{BASE}</span>
        </div>
        {sparklineData && sparklineData.length >= 2 && (
          <Sparkline data={sparklineData} trend={trendDir} width={80} height={28} />
        )}
      </div>

      <p className="ep-card__updated">Updated 2m ago</p>

      {/* footer */}
      {/* DÜZELTME: gereksiz ternary kaldırıldı, code zaten doğru değeri taşıyor */}
      <div className="ep-card__foot">
        <span className="ep-card__base">1 {code}</span>
        <TrendBadge trend={trendDir} change={isMetal ? null : trendPct} />
      </div>
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ title }) {
  return (
    <div className="ep-section__header">
      <span className="ep-section__title">{title}</span>
      <div className="ep-section__line" />
    </div>
  );
}

/* ── Dashboard Header ── */
function DashboardHeader({ date, onRefresh }) {
  return (
    <div className="ep-header">
      <div className="ep-header__left">
        <div className="ep-header__overline">
          <span className="ep-header__live-dot" />
          LIVE MARKET DATA
        </div>
        <h1 className="ep-header__title">Exchange Rates</h1>
      </div>

      <div className="ep-header__right">
        <div className="ep-header__meta">
          <div className="ep-header__meta-row">
            <span className="ep-header__meta-label">Last updated</span>
            <span className="ep-header__meta-value">{date || "—"}</span>
          </div>
          <div className="ep-header__meta-row">
            <span className="ep-header__meta-label">Base currency</span>
            <span className="ep-header__meta-value ep-header__meta-value--accent">TRY</span>
          </div>
        </div>
        <button type="button" className="ep-header__refresh" onClick={onRefresh}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  );
}

/* ── P&L Calculator ── */
function ProfitLossCalculator({ rates, entry, setEntry }) {
  // DÜZELTME: useMemo + saved aracı kaldırıldı, lazy initializer yeterli
  const [calcCur,    setCalcCur]    = useState(() => loadEntry()?.cur    || "USD");
  const [calcAmount, setCalcAmount] = useState(() => {
    const s = loadEntry();
    return s?.amount ? String(s.amount) : "";
  });

  const amountNum   = Math.abs(toAmount(calcAmount));
  const currentRate = rates?.[calcCur] ?? null;
  const currentTRY  = amountNum && currentRate ? amountNum * currentRate : null;

  const pnl = useMemo(() => {
    if (!entry) return null;
    const nowRate = rates?.[entry.cur] ?? null;
    if (!nowRate)  return null;
    const entryVal = entry.amount * entry.rate;
    const nowVal   = entry.amount * nowRate;
    const diff     = nowVal - entryVal;
    const pct      = (diff / entryVal) * 100;
    return { ...entry, entryVal, nowVal, diff, pct };
  }, [entry, rates]);

  const handleSetEntry = () => {
    if (!currentRate || !amountNum) return;
    const next = { cur: calcCur, amount: amountNum, rate: currentRate };
    setEntry(next);
    saveEntry(next);
  };
  const handleClear = () => { setEntry(null); saveEntry(null); };

  const heroSparkline = [32.1, 32.3, 32.0, 32.4, 32.5, 32.6, 32.49];

  return (
    <div className="ep-calc">
      {/* left — form */}
      <div className="ep-calc__left">
        <p className="ep-calc__eyebrow">P&amp;L TRACKER</p>
        <p className="ep-calc__sub">Calculate return on your open position</p>

        <div className="ep-calc__fields">
          <div className="ep-field">
            <label>Currency</label>
            <select value={calcCur} onChange={(e) => setCalcCur(e.target.value)}>
              {ALL.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="ep-field">
            <label>Amount</label>
            <input
              value={calcAmount}
              onChange={(e) => setCalcAmount(e.target.value)}
              placeholder="e.g. 100"
              inputMode="decimal"
            />
          </div>
        </div>

        <div className="ep-calc__actions">
          <button
            type="button"
            className="ep-btn ep-btn--primary"
            onClick={handleSetEntry}
            disabled={!currentRate || !amountNum}
          >
            Set Entry
          </button>
          <button
            type="button"
            className="ep-btn ep-btn--outline"
            onClick={handleClear}
            disabled={!entry}
          >
            Clear
          </button>
        </div>

        {entry && (
          <p className="ep-calc__entry-note">
            Entry locked → {entry.amount} {entry.cur} at ₺{entry.rate.toFixed(4)}
          </p>
        )}
      </div>

      {/* right — results */}
      <div className="ep-calc__right">
        <div className="ep-calc__stat">
          <p className="ep-calc__stat-label">CURRENT VALUE</p>
          <p className="ep-calc__stat-value">
            ₺{currentTRY != null ? currentTRY.toFixed(2) : "0.00"}
          </p>
          <p className="ep-calc__stat-sub">TRY equivalent</p>
        </div>

        <div className="ep-calc__stat">
          <p className="ep-calc__stat-label">TOTAL RETURN</p>
          {entry && pnl ? (
            <>
              <p className={`ep-calc__pnl-value ${pnl.diff >= 0 ? "ep-calc__pnl-value--up" : "ep-calc__pnl-value--down"}`}>
                {pnl.diff >= 0 ? "+" : ""}₺{pnl.diff.toFixed(2)}
              </p>
              <div className="ep-calc__pnl-row">
                <span className={`ep-calc__pnl-pct ${pnl.diff >= 0 ? "ep-calc__pnl-pct--up" : "ep-calc__pnl-pct--down"}`}>
                  {pnl.diff >= 0 ? "+" : ""}{pnl.pct.toFixed(2)}%
                </span>
                <span className={`ep-calc__pnl-arrow ${pnl.diff >= 0 ? "ep-calc__pnl-arrow--up" : "ep-calc__pnl-arrow--down"}`}>
                  {pnl.diff >= 0 ? "↑" : "↓"}
                </span>
              </div>
              <p className="ep-calc__pnl-sub">
                ₺{pnl.entryVal.toFixed(2)} → ₺{pnl.nowVal.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="ep-calc__hint">Set an entry price to track P&amp;L</p>
          )}
        </div>

        <div className="ep-calc__sparkline">
          <Sparkline data={heroSparkline} trend="up" width={120} height={48} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   MAIN PAGE
   ════════════════════════════════ */
export default function ExchangePage() {
  const [rates,     setRates]     = useState({});
  const [prevRates, setPrevRates] = useState({});
  const [date,      setDate]      = useState("");
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [metals,    setMetals]    = useState({ gold: null, silver: null, missingKey: false, error: "", source: "" });
  const [favorites, setFavorites] = useState(() => loadFavorites());
  const [entry,     setEntry]     = useState(() => loadEntry());

  // DÜZELTME: favorites'a göre çakışma olmadan ayrıştır
  const primary   = useMemo(() => ALL.filter((c) =>  favorites.includes(c)), [favorites]);
  const secondary = useMemo(() => ALL.filter((c) => !favorites.includes(c)), [favorites]);

  // DÜZELTME: Major Currencies favorilerle çakışmaması için filtrele
  const major = useMemo(
    () => ["USD", "EUR", "GBP"].filter((c) => !favorites.includes(c)),
    [favorites]
  );

  const toggleFavorite = (cur) => {
    setFavorites((prev) => {
      const next = prev.includes(cur) ? prev.filter((x) => x !== cur) : [...prev, cur];
      saveFavorites(next);
      return next;
    });
  };

  const SPARKLINES = {
    USD: [31.8, 32.0, 32.3, 32.2, 32.4, 32.5, 32.49],
    EUR: [35.4, 35.3, 35.2, 35.3, 35.1, 35.0, 35.12],
    GBP: [40.1, 40.3, 40.6, 40.5, 40.8, 41.0, 41.06],
    JPY: [0.217, 0.216, 0.215, 0.215, 0.214, 0.214, 0.214],
    AUD: [21.1, 21.2, 21.3, 21.2, 21.3, 21.35, 21.34],
    CAD: [23.8, 23.87, 23.87, 23.87, 23.87, 23.87, 23.87],
    CHF: [36.5, 36.52, 36.54, 36.56, 36.58, 36.59, 36.59],
  };

  // DÜZELTME: useCallback ile sabit referans + Promise.all ile paralel fetch
  // + AbortController ile race condition önlemi
  // + setPrevRates(prev => ...) yerine setRates functional updater içinde önceki state alındı
  const fetchRates = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const results = await Promise.all(
        ALL.map((cur) =>
          fetch(`${API_BASE}/latest?from=${cur}&to=${BASE}`, { signal })
            .then((r) => {
              if (!r.ok) throw new Error("Kur verisi alınamadı.");
              return r.json();
            })
            .then((data) => ({ cur, rate: data?.rates?.[BASE] ?? null, date: data?.date || "" }))
        )
      );

      const newRates = {};
      let lastDate   = "";
      results.forEach(({ cur, rate, date: d }) => {
        newRates[cur] = rate;
        if (d) lastDate = d;
      });

      // DÜZELTME: functional updater ile önceki rates güvenle alınıyor (stale closure yok)
      setRates((prev) => {
        setPrevRates(prev);
        return newRates;
      });
      setDate(lastDate);

      const metalsData = await fetchMetalsGramTRY();
      setMetals(metalsData);
    } catch (e) {
      if (e.name === "AbortError") return; // iptal edilen isteği yoksay
      setError(e?.message || "Bilinmeyen hata.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchRates(controller.signal);

    const id = setInterval(() => {
      const ctrl = new AbortController();
      fetchRates(ctrl.signal);
    }, 10 * 60 * 1000);

    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [fetchRates]);

  const getTrend = (cur) => {
    const t = computeTrend(prevRates[cur], rates[cur]);
    return t?.dir ?? "flat";
  };

  return (
    <div className="ep-page">
      <div className="ep-bg-blob ep-bg-blob--tr" />
      <div className="ep-bg-blob ep-bg-blob--bl" />

      <DashboardHeader date={date} onRefresh={() => fetchRates(new AbortController().signal)} />

      <ProfitLossCalculator rates={rates} entry={entry} setEntry={setEntry} />

      {loading && <p className="ep-info">Loading live rates…</p>}
      {error   && <p className="ep-error">{error}</p>}

      {!loading && !error && (
        <>
          {/* ── Favorites ── */}
          {primary.length > 0 && (
            <section className="ep-section">
              <SectionHeader title="Favorites" />
              <div className={`ep-grid ep-grid--${Math.min(primary.length, 3)}`}>
                {primary.map((cur) => (
                  <CurrencyCard
                    key={cur}
                    code={cur}
                    name={CURRENCY_META[cur].name}
                    badge={CURRENCY_META[cur].short}
                    rate={rates[cur]}
                    prevRate={prevRates[cur]}
                    sparklineData={SPARKLINES[cur]}
                    isFav
                    onToggleFav={() => toggleFavorite(cur)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Major Currencies — favorilerle çakışmaz ── */}
          {major.length > 0 && (
            <section className="ep-section">
              <SectionHeader title="Major Currencies" />
              <div className={`ep-grid ep-grid--${major.length}`}>
                {major.map((cur) => (
                  <CurrencyCard
                    key={cur}
                    code={cur}
                    name={CURRENCY_META[cur].name}
                    badge={CURRENCY_META[cur].short}
                    rate={rates[cur]}
                    prevRate={prevRates[cur]}
                    sparklineData={SPARKLINES[cur]}
                    isFav={favorites.includes(cur)}
                    onToggleFav={() => toggleFavorite(cur)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Metals + Other side by side ── */}
          <div className="ep-bottom-grid">
            {/* Precious Metals */}
            <section className="ep-section">
              <SectionHeader title="Precious Metals" />
              {metals.missingKey && (
                <p className="ep-info">Metals need API key — add VITE_GOLDAPI_KEY to .env and restart.</p>
              )}
              {!metals.missingKey && metals.error && <p className="ep-error">{metals.error}</p>}
              {metals.source === "mock" && (
                <p className="ep-info">Metal prices are mocked.</p>
              )}
              <div className="ep-grid ep-grid--2">
                <CurrencyCard
                  code="GOLD" name="Gold · per gram · XAU" badge="Au"
                  rate={metals.gold} isMetal
                  metalType="gold"
                  cardStyle={{ boxShadow: undefined }}
                />
                <CurrencyCard
                  code="SILVER" name="Silver · per gram · XAG" badge="Ag"
                  rate={metals.silver} isMetal
                  metalType="silver"
                />
              </div>
            </section>

            {/* Other Currencies */}
            <section className="ep-section">
              <SectionHeader title="Other Currencies" />
              <div className="ep-grid ep-grid--2">
                {secondary.map((cur) => (
                  <CurrencyCard
                    key={cur}
                    code={cur}
                    name={CURRENCY_META[cur].name}
                    badge={CURRENCY_META[cur].short}
                    rate={rates[cur]}
                    prevRate={prevRates[cur]}
                    sparklineData={SPARKLINES[cur]}
                    isFav={false}
                    onToggleFav={() => toggleFavorite(cur)}
                  />
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}