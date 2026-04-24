/* ═══════════════════════════════════════════════════
   src/services/metalsApi.js

   Öncelik sırası:
   1. GoldAPI.io  (VITE_GOLDAPI_KEY varsa — canlı veri)
   2. Frankfurter (USD/TRY) + güncel ons fiyatı (mock)

   ÖNEMLİ: .env dosyasına şunu ekle:
   VITE_GOLDAPI_KEY=buraya_goldapi_key_yaz

   Sonra: npm run dev (server'ı yeniden başlat)
═══════════════════════════════════════════════════ */

const OUNCE_TO_GRAM = 31.1034768;

/* ── Güncel mock ons fiyatları (Nisan 2026) ──
   GoldAPI key yoksa bu değerler kullanılır.
   Frankfurter'dan gerçek USD/TRY çekilir,
   sadece ons fiyatı sabit kalır.             */
const MOCK_GOLD_ONS_USD   = 4750;   // ~$4,750/ons (Nisan 2026 piyasası)
const MOCK_SILVER_ONS_USD = 78;     // ~$78/ons    (Nisan 2026 piyasası)

export async function fetchMetalsGramTRY() {
  const key = import.meta.env.VITE_GOLDAPI_KEY;

  /* ── 1. GoldAPI.io — canlı veri (key varsa) ── */
  if (key) {
    try {
      const headers = { "x-access-token": key, "Content-Type": "application/json" };

      const [gRes, sRes, usdRes] = await Promise.all([
        fetch("https://www.goldapi.io/api/XAU/USD", { headers }),
        fetch("https://www.goldapi.io/api/XAG/USD", { headers }),
        fetch("https://api.frankfurter.dev/v1/latest?from=USD&to=TRY"),
      ]);

      if (!gRes.ok) throw new Error(`GoldAPI gold error: ${gRes.status}`);
      if (!sRes.ok) throw new Error(`GoldAPI silver error: ${sRes.status}`);
      if (!usdRes.ok) throw new Error("Frankfurter USD/TRY error");

      const g       = await gRes.json();
      const s       = await sRes.json();
      const usdData = await usdRes.json();
      const tryRate = usdData?.rates?.TRY ?? null;

      if (!tryRate) throw new Error("TRY rate missing from Frankfurter");

      /* GoldAPI yanıtında gram fiyatı veya ons fiyatı olabilir */
      const gUSD = g.price_gram_24k
        ?? (g.price ? Number(g.price) / OUNCE_TO_GRAM : null);
      const sUSD = s.price_gram_24k
        ?? (s.price ? Number(s.price) / OUNCE_TO_GRAM : null);

      if (!Number.isFinite(gUSD) || !Number.isFinite(sUSD)) {
        throw new Error("GoldAPI yanıtında fiyat bulunamadı");
      }

      return {
        gold:       gUSD * tryRate,
        silver:     sUSD * tryRate,
        missingKey: false,
        fromMock:   false,
        error:      "",
        source:     "live",   // canlı veri
      };

    } catch (e) {
      console.warn("GoldAPI hatası, mock'a geçiliyor:", e?.message);
      /* key var ama istek başarısız → aşağıdaki mock'a düş */
    }
  }

  /* ── 2. Mock — Frankfurter'dan gerçek USD/TRY + sabit ons ── */
  try {
    const res = await fetch("https://api.frankfurter.dev/v1/latest?from=USD&to=TRY");
    if (!res.ok) throw new Error("Frankfurter isteği başarısız");

    const data    = await res.json();
    const tryRate = data?.rates?.TRY;

    if (!Number.isFinite(tryRate) || tryRate <= 0) {
      throw new Error("Geçersiz TRY kuru");
    }

    return {
      gold:       (MOCK_GOLD_ONS_USD   / OUNCE_TO_GRAM) * tryRate,
      silver:     (MOCK_SILVER_ONS_USD / OUNCE_TO_GRAM) * tryRate,
      missingKey: !key,      // key hiç girilmemişse true
      fromMock:   true,
      error:      "",
      source:     "mock",
    };

  } catch (e) {
    console.warn("Frankfurter de başarısız, sabit fallback:", e?.message);
  }

  /* ── 3. Son çare — her şey çöktüyse sabit değer ── */
  const fallbackTRY = 44.9;
  return {
    gold:       (MOCK_GOLD_ONS_USD   / OUNCE_TO_GRAM) * fallbackTRY,
    silver:     (MOCK_SILVER_ONS_USD / OUNCE_TO_GRAM) * fallbackTRY,
    missingKey: !key,
    fromMock:   true,
    error:      "Veri alınamadı, tahmini değer gösteriliyor.",
    source:     "fallback",
  };
}
