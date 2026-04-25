import { useEffect, useRef, useState } from "react";
import "./SettingsPage.css";
import { transactions as mockTransactions } from "../../data/mockTransactions.js";

/* ─── POT COLORS ─────────────────────────────────── */
const POT_COLORS = [
  "#6366F1","#10B981","#F59E0B","#EF4444",
  "#3B82F6","#EC4899","#14B8A6","#8B5CF6",
];

const currencySymbol = (c) =>
  c === "TRY" ? "₺" : c === "EUR" ? "€" : "$";

/* ─── INLINE SVG ICONS ───────────────────────────── */
const Ico = ({ d, ...p }) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" {...p}>
    {d}
  </svg>
);

const IcoUser     = () => <Ico d={<><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>} />;
const IcoSun      = () => <Ico d={<><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/></>} />;
const IcoBarChart  = () => <Ico d={<><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></>} />;
const IcoDatabase  = () => <Ico d={<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></>} />;
const IcoBell      = () => <Ico d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>} />;
const IcoPiggy     = () => <Ico d={<><path d="M19 10c0-3.87-3.13-7-7-7H9C5.69 3 3 5.69 3 9v2H2v3h1v1a2 2 0 0 0 2 2h1v2h3v-2h4v2h3v-2h1a2 2 0 0 0 2-2v-1h1v-3h-1v-1z"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor"/><path d="M19 7l2-2"/></>} />;
const IcoGlobe     = () => <Ico d={<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>} />;
const IcoHash      = () => <Ico d={<><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></>} />;
const IcoCog       = () => <Ico d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>} />;
const IcoStar      = () => <Ico d={<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>} />;
const IcoClock     = () => <Ico d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />;
const IcoKey       = () => <Ico d={<><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></>} />;
const IcoSave      = () => <Ico d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>} />;
const IcoTrash     = () => <Ico d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></>} />;
const IcoRefresh   = () => <Ico d={<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></>} />;
const IcoCheck     = () => <Ico d={<><polyline points="20 6 9 17 4 12"/></>} />;
const IcoRateAlert = () => <Ico d={<><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>} />;
const IcoPortfolio = () => <Ico d={<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>} />;

/* ─── REUSABLE: Toggle ───────────────────────────── */
const Toggle = ({ on, onClick, disabled }) => (
  <button
    type="button"
    className="toggle"
    data-on={on}
    data-disabled={disabled}
    onClick={disabled ? undefined : onClick}
    aria-label="toggle"
  >
    <span className="toggle-knob" />
  </button>
);

/* ─── REUSABLE: Segment group ────────────────────── */
const SegmentGroup = ({ options, value, onChange }) => (
  <div className="segment-group">
    {options.map((o) => (
      <button
        key={o.value}
        className={`segment-btn${value === o.value ? " active" : ""}`}
        onClick={() => onChange(o.value)}
      >
        {o.label}
      </button>
    ))}
  </div>
);

/* ─── REUSABLE: Section card ─────────────────────── */
const Section = ({ icon, title, badge, children, fullWidth }) => (
  <section className={`settings-section${fullWidth ? " full-width" : ""}`}>
    <div className="section-header">
      <div className="section-icon">{icon}</div>
      <h2>{title}</h2>
      {badge && <span className="coming-soon-badge">{badge}</span>}
    </div>
    <div className="section-body">{children}</div>
  </section>
);

/* ─── REUSABLE: Setting row ──────────────────────── */
const SettingRow = ({ icon, label, sub, control }) => (
  <div className="setting-row">
    <div className="row-icon">{icon}</div>
    <div className="row-label">
      <span>{label}</span>
      {sub && <small>{sub}</small>}
    </div>
    <div className="row-control">{control}</div>
  </div>
);

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const SettingsPage = () => {
  /* ── state ── */
  const [profile, setProfile] = useState({ displayName: "", email: "" });
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("settings") || "{}");
      const theme = saved.prefs?.theme || "light";
      // Sayfa mount olur olmaz doğru temayı uygula — flash olmadan
      if (theme === "dark") document.body.classList.add("theme-dark");
      else document.body.classList.remove("theme-dark");
      return {
        theme,
        language: "en",
        currency: "TRY",
        dateFormat: "DD/MM/YYYY",
        numberFormat: "1,234.56",
        priceDecimals: 4,
        favoriteMetals: ["Gold"],
        compactView: false,
        showSparklines: true,
        fontSize: "M",
      };
    } catch {
      return {
        theme: "light",
        language: "en",
        currency: "TRY",
        dateFormat: "DD/MM/YYYY",
        numberFormat: "1,234.56",
        priceDecimals: 4,
        favoriteMetals: ["Gold"],
        compactView: false,
        showSparklines: true,
        fontSize: "M",
      };
    }
  });
  const [dataMgmt, setDataMgmt] = useState({
    refreshInterval: "10",
    apiKey: "",
    autoSavePositions: true,
  });
  const [notifications, setNotifications] = useState({
    rateAlerts: false,
    portfolioUpdates: false,
    marketOpens: false,
  });
  const [pots, setPots] = useState([]);
  const [newPotName, setNewPotName] = useState("");
  const [newPotTarget, setNewPotTarget] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const dirtyCount  = useRef(0);
  const potNameRef  = useRef(null);
  const avatarFileRef = useRef(null);
  const notifTimers = useRef({});

  /* ── load ── */
  useEffect(() => {
    const saved = localStorage.getItem("settings");
    if (!saved) return;
    try {
      const s = JSON.parse(saved);
      if (s.profile)       setProfile(s.profile);
      if (s.prefs)         setPrefs((d) => ({ ...d, ...s.prefs, favoriteMetals: Array.isArray(s.prefs.favoriteMetals) ? s.prefs.favoriteMetals : d.favoriteMetals }));
      if (s.dataMgmt)      setDataMgmt(s.dataMgmt);
      if (s.notifications) setNotifications(s.notifications);
      if (s.pots)          setPots(s.pots);
      if (s.lastSaved)     setLastSaved(s.lastSaved);
    } catch {}
  }, []);

  /* ── track dirty ── */
  useEffect(() => {
    if (dirtyCount.current < 2) { dirtyCount.current++; return; }
    setIsDirty(true);
  }, [profile, prefs, dataMgmt, notifications, pots]);

  /* ── dark mode ── */
  useEffect(() => {
    if (prefs.theme === "dark") document.body.classList.add("theme-dark");
    else document.body.classList.remove("theme-dark");
  }, [prefs.theme]);

  /* ── save ── */
  const saveChanges = () => {
    const now = new Date().toISOString();
    localStorage.setItem("settings", JSON.stringify({
      profile, prefs, dataMgmt, notifications, pots, lastSaved: now,
    }));

    window.dispatchEvent(new Event('financeapp:settings_saved'));
    
    setLastSaved(now);
    setIsDirty(false);
  };

  const discardChanges = () => {
    const saved = localStorage.getItem("settings");
    if (!saved) return;
    try {
      const s = JSON.parse(saved);
      if (s.profile)       setProfile(s.profile);
      if (s.prefs)         setPrefs((d) => ({ ...d, ...s.prefs, favoriteMetals: Array.isArray(s.prefs.favoriteMetals) ? s.prefs.favoriteMetals : d.favoriteMetals }));
      if (s.dataMgmt)      setDataMgmt(s.dataMgmt);
      if (s.notifications) setNotifications(s.notifications);
      if (s.pots)          setPots(s.pots);
    } catch {}
    setIsDirty(false);
  };

  /* ── helpers ── */
  const setPref  = (k, v) => {
    setPrefs((p) => ({ ...p, [k]: v }));
    // Tema degisince kaydet beklemeden localStorage'a yaz
    if (k === "theme") {
      try {
        const saved = JSON.parse(localStorage.getItem("settings") || "{}");
        saved.prefs = { ...(saved.prefs || {}), theme: v };
        localStorage.setItem("settings", JSON.stringify(saved));
      } catch {}
    }
  };
  const setDM    = (k, v) => setDataMgmt((d) => ({ ...d, [k]: v }));
  const setNotif = (k) => setNotifications((n) => ({ ...n, [k]: !n[k] }));

  /* ── notification logic ── */
  const NOTIF_CONFIG = {
    rateAlerts:       { title: "📈 Rate Alert",       body: "USD/TRY has made a significant move. Check the Exchange page.",   demo: 15000 },
    portfolioUpdates: { title: "💼 Portfolio Update",  body: "Your daily portfolio summary is ready. Open the app to review.", demo: 20000 },
    marketOpens:      { title: "🔔 Markets Open",      body: "Markets are now open. Have a great trading session!",            demo: 25000 },
  };

  const sendNotif = (key) => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    const { title, body } = NOTIF_CONFIG[key];
    new Notification(title, { body, icon: "/favicon.ico" });
  };

  const startTimer = (key) => {
    if (notifTimers.current[key]) return;
    notifTimers.current[key] = setInterval(() => sendNotif(key), NOTIF_CONFIG[key].demo);
  };

  const stopTimer = (key) => {
    clearInterval(notifTimers.current[key]);
    delete notifTimers.current[key];
  };

  const handleNotifToggle = async (key) => {
    if (typeof Notification === "undefined") return;

    /* İzin henüz sorulmadıysa sor */
    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
      if (result !== "granted") return;
    }

    if (Notification.permission === "denied") return;

    /* Side effect'leri setNotifications dışında yap */
    const next = !notifications[key];
    if (next) {
      startTimer(key);
      /* Anlık onay bildirimi */
      setTimeout(() => new Notification("✅ Bildirim aktif", {
        body: `${NOTIF_CONFIG[key].title.slice(3)} bildirimleri açıldı.`,
        icon: "/favicon.ico",
      }), 400);
    } else {
      stopTimer(key);
    }
    setNotifications((n) => ({ ...n, [key]: next }));
  };

  /* Sayfa kapanınca tüm timer'ları temizle */
  useEffect(() => {
    const timers = notifTimers.current;
    return () => Object.keys(timers).forEach((k) => {
      clearInterval(timers[k]);
      delete timers[k];
    });
  }, []);

  /* localStorage'dan yüklenen aktif notification'ları başlat —
     hem izin zaten verilmişse (notifPermission=granted),
     hem de yükleme sonrası notifications güncellendikten sonra çalışır */
  useEffect(() => {
    if (notifPermission !== "granted") return;
    Object.entries(notifications).forEach(([k, v]) => {
      if (v && !notifTimers.current[k]) startTimer(k);
      if (!v && notifTimers.current[k]) stopTimer(k);
    });
  // notifications değişince timer'ları senkronize et
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, notifPermission]);

  /* ── avatar ── */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile((p) => ({ ...p, avatarUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
    // input'u sıfırla — aynı dosyayı tekrar seçebilsin
    e.target.value = "";
  };

  const removeAvatar = () => {
    setProfile((p) => ({ ...p, avatarUrl: "" }));
  };

  const toggleMetal = (metal) => {
    setPrefs((p) => {
      const metals = p.favoriteMetals ?? [];
      const has = metals.includes(metal);
      return {
        ...p,
        favoriteMetals: has
          ? metals.filter((m) => m !== metal)
          : [...metals, metal],
      };
    });
  };

  const metalClass = (metal) => {
    const metals = prefs.favoriteMetals ?? [];
    if (!metals.includes(metal)) return "metal-toggle-btn";
    if (metal === "Gold")     return "metal-toggle-btn active-gold";
    if (metal === "Silver")   return "metal-toggle-btn active-silver";
    if (metal === "Platinum") return "metal-toggle-btn active-platinum";
    return "metal-toggle-btn";
  };

  const initials = profile.displayName
    ? profile.displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "AY";

  /* ── pots ── */
  const addPot = () => {
    const name = newPotName.trim();
    const target = parseFloat(newPotTarget);
    if (!name || isNaN(target) || target <= 0) return;
    setPots((prev) => [
      ...prev,
      { id: Date.now(), name, targetAmount: target, currentAmount: 0,
        color: POT_COLORS[prev.length % POT_COLORS.length] },
    ]);
    setNewPotName(""); setNewPotTarget("");
    potNameRef.current?.focus();
  };

  const deletePot = (id) => setPots((prev) => prev.filter((p) => p.id !== id));

  /* ── export ── */
  const exportTransactions = () => {
    const fromLS = localStorage.getItem("transactions");
    let data = [];
    try { data = fromLS ? JSON.parse(fromLS) : (mockTransactions || []); } catch {}
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "transactions.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const clearCache = () => {
    if (!window.confirm("Clear cache & history?")) return;
    localStorage.removeItem("transactions");
    window.alert("Cache cleared.");
  };

  const resetAll = () => {
    if (!window.confirm("Reset ALL data? This cannot be undone.")) return;
    localStorage.clear();
    window.alert("All data reset. Please refresh.");
  };

  /* ── saved time label ── */
  const savedLabel = lastSaved
    ? (() => {
        const mins = Math.round((Date.now() - new Date(lastSaved).getTime()) / 60000);
        if (mins < 1) return "Last saved just now";
        if (mins === 1) return "Last saved 1 minute ago";
        return `Last saved ${mins} minutes ago`;
      })()
    : "Not saved yet";

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="settings-page">
      {/* ── Top bar ── */}
      <div className="settings-topbar">
        <h1>Settings</h1>
        <div className="topbar-right">
          {isDirty && (
            <span className="unsaved-badge">
              <span className="unsaved-dot" />
              {Object.keys({ profile, prefs, dataMgmt, notifications }).length} unsaved changes
            </span>
          )}
          <button className="btn btn-primary" onClick={saveChanges}>
            Save Changes
          </button>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="settings-grid">

        {/* ══ ROW 1: Profile + Appearance ══ */}

        {/* Profile */}
        <Section icon={<IcoUser />} title="Profile">
          <div className="profile-avatar-row">
            {/* Avatar: resim varsa göster, yoksa baş harfler */}
            <div className="avatar-wrapper">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="avatar-img"
                />
              ) : (
                <div className="avatar-initials">{initials}</div>
              )}
              {/* Kamera ikonu overlay */}
              <button
                type="button"
                className="avatar-edit-btn"
                onClick={() => avatarFileRef.current?.click()}
                title="Change avatar"
              >
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
              {/* Gizli file input */}
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </div>

            <div className="avatar-meta">
              <strong>{profile.displayName || "Your Name"}</strong>
              <span>{profile.email || "—"}</span>
              <div className="avatar-actions">
                <button
                  type="button"
                  className="avatar-link"
                  onClick={() => avatarFileRef.current?.click()}
                >
                  Change Avatar →
                </button>
                {profile.avatarUrl && (
                  <button
                    type="button"
                    className="avatar-link avatar-link--remove"
                    onClick={removeAvatar}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="profile-field">
            <label>Display Name</label>
            <input
              className="input"
              value={profile.displayName}
              onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
              placeholder="User Name"
            />
          </div>

          <div className="profile-field">
            <label>Email</label>
            <input
              className="input"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              placeholder="name@example.com"
            />
          </div>
        </Section>

        {/* Appearance */}
        <Section icon={<IcoSun />} title="Appearance">
          {/* Light / Dark card selector */}
          <div className="theme-cards">
            {["light", "dark"].map((t) => (
              <div
                key={t}
                className={`theme-card${prefs.theme === t ? " selected" : ""}`}
                onClick={() => setPref("theme", t)}
              >
                {prefs.theme === t && (
                  <div className="theme-card-check"><IcoCheck /></div>
                )}
                {t === "light" ? (
                  <div className="theme-preview-light">
                    <div className="preview-bar" />
                    <div className="preview-bar preview-bar-short" />
                  </div>
                ) : (
                  <div className="theme-preview-dark">
                    <div className="preview-bar" />
                    <div className="preview-bar preview-bar-short" />
                  </div>
                )}
                <div className="theme-label">{t === "light" ? "Light" : "Dark"}</div>
              </div>
            ))}
          </div>

          <SettingRow
            icon={<IcoCog />}
            label="Compact View"
            sub="Reduce spacing between elements"
            control={
              <Toggle on={prefs.compactView} onClick={() => setPref("compactView", !prefs.compactView)} />
            }
          />
          <SettingRow
            icon={<IcoBarChart />}
            label="Show Sparklines on Cards"
            sub="Mini trend charts on currency cards"
            control={
              <Toggle on={prefs.showSparklines} onClick={() => setPref("showSparklines", !prefs.showSparklines)} />
            }
          />
          <SettingRow
            icon={<IcoHash />}
            label="Font Size"
            sub="Interface text size"
            control={
              <SegmentGroup
                options={[{value:"S",label:"S"},{value:"M",label:"M"},{value:"L",label:"L"}]}
                value={prefs.fontSize}
                onChange={(v) => setPref("fontSize", v)}
              />
            }
          />
        </Section>

        {/* ══ ROW 2: Financial Preferences + Data Management ══ */}

        {/* Financial Preferences */}
        <Section icon={<IcoBarChart />} title="Financial Preferences">
          <SettingRow
            icon={<IcoGlobe />}
            label="Default Currency"
            sub="Base for all calculations"
            control={
              <select
                className="select"
                value={prefs.currency}
                onChange={(e) => setPref("currency", e.target.value)}
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            }
          />
          <SettingRow
            icon={<IcoHash />}
            label="Number Format"
            sub="How prices are displayed"
            control={
              <>
                {["1,234.56","1.234,56"].map((fmt) => (
                  <button
                    key={fmt}
                    className={`segment-btn${prefs.numberFormat === fmt ? " active" : ""}`}
                    style={{ border:"1.5px solid #E5E7EB", borderRadius:7, padding:"0.35rem 0.6rem", fontFamily:"inherit", fontSize:"0.78rem", fontWeight:600, cursor:"pointer", background: prefs.numberFormat===fmt?"#1a1d23":"transparent", color: prefs.numberFormat===fmt?"#fff":"#6B7280" }}
                    onClick={() => setPref("numberFormat", fmt)}
                  >
                    {fmt}
                  </button>
                ))}
              </>
            }
          />
          <SettingRow
            icon={<IcoCog />}
            label="Price Decimals"
            sub="Decimal places for rates"
            control={
              <div className="stepper">
                <button
                  className="stepper-btn"
                  onClick={() => setPref("priceDecimals", Math.max(0, prefs.priceDecimals - 1))}
                >−</button>
                <span className="stepper-val">{prefs.priceDecimals}</span>
                <button
                  className="stepper-btn"
                  onClick={() => setPref("priceDecimals", Math.min(8, prefs.priceDecimals + 1))}
                >+</button>
              </div>
            }
          />
          <SettingRow
            icon={<IcoStar />}
            label="Favorite Metals"
            sub="Metals shown on dashboard"
            control={
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {["Gold","Silver","Platinum"].map((m) => (
                  <button key={m} className={metalClass(m)} onClick={() => toggleMetal(m)}>
                    {m}
                  </button>
                ))}
              </div>
            }
          />
        </Section>

        {/* Data Management */}
        <Section icon={<IcoDatabase />} title="Data Management">
          <SettingRow
            icon={<IcoClock />}
            label="Refresh Interval"
            sub="How often to fetch new rates"
            control={
              <SegmentGroup
                options={[{value:"5",label:"5 min"},{value:"10",label:"10 min"},{value:"30",label:"30 min"}]}
                value={dataMgmt.refreshInterval}
                onChange={(v) => setDM("refreshInterval", v)}
              />
            }
          />
          <SettingRow
            icon={<IcoKey />}
            label="API Key"
            sub="GoldAPI key for metal prices"
            control={null}
          />
          {/* API key below the row */}
          <div className="api-key-row">
            <input
              className="api-key-input"
              type={showApiKey ? "text" : "password"}
              value={dataMgmt.apiKey}
              onChange={(e) => setDM("apiKey", e.target.value)}
              placeholder="Enter your GoldAPI key…"
            />
            <button className="api-key-show-btn" onClick={() => setShowApiKey((s) => !s)}>
              {showApiKey ? "Hide" : "Show"}
            </button>
          </div>

          <SettingRow
            icon={<IcoSave />}
            label="Auto-save Positions"
            sub="Save P&L entries locally"
            control={
              <Toggle
                on={dataMgmt.autoSavePositions}
                onClick={() => setDM("autoSavePositions", !dataMgmt.autoSavePositions)}
              />
            }
          />

          <div className="data-actions">
            <button className="data-action-btn" onClick={clearCache}>
              <IcoTrash /> Clear Cache &amp; History
            </button>
            <button className="data-action-btn danger" onClick={resetAll}>
              <IcoRefresh /> Reset All Data
            </button>
          </div>
        </Section>

        {/* ══ ROW 3: Notifications (full-width) ══ */}
        <Section icon={<IcoBell />} title="Notifications" fullWidth>

          {/* İzin durumu banner */}
          {notifPermission === "denied" && (
            <div className="notif-banner notif-banner--warn">
              ⚠️ Tarayıcı bildirimleri engellenmiş. Adres çubuğundaki kilit ikonuna tıklayıp izin ver.
            </div>
          )}
          {notifPermission === "granted" && (
            <div className="notif-banner notif-banner--ok">
              ✅ Bildirim izni verildi. Aşağıdan istediklerini aktif et.
            </div>
          )}
          {notifPermission === "unsupported" && (
            <div className="notif-banner notif-banner--warn">
              ⚠️ Bu tarayıcı bildirimleri desteklemiyor.
            </div>
          )}

          <div className="notifications-grid">
            {[
              { key:"rateAlerts",       label:"Rate Alerts",       sub:"Kur önemli değişince bildirim",   icon:<IcoRateAlert /> },
              { key:"portfolioUpdates", label:"Portfolio Updates",  sub:"Günlük portföy özeti",            icon:<IcoPortfolio /> },
              { key:"marketOpens",      label:"Market Opens",       sub:"Piyasalar açılınca uyarı",        icon:<IcoClock /> },
            ].map(({ key, label, sub, icon }) => (
              <div key={key} className="notif-item">
                <div className="notif-item-top">
                  <div className="notif-icon">{icon}</div>
                  <Toggle
                    on={notifications[key]}
                    onClick={() => handleNotifToggle(key)}
                    disabled={notifPermission === "denied" || notifPermission === "unsupported"}
                  />
                </div>
                <div className="notif-label">{label}</div>
                <div className="notif-sublabel">{sub}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ══ ROW 4: Manage Pots (full-width) ══ */}
        <Section icon={<IcoPiggy />} title="Manage Pots" fullWidth>
          <div className="pots-add-form">
            <input
              ref={potNameRef}
              className="input"
              placeholder="Pot name (e.g. Holiday Fund)"
              value={newPotName}
              onChange={(e) => setNewPotName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPot()}
            />
            <input
              className="input input-number"
              type="number"
              placeholder="Target amount"
              min="1"
              value={newPotTarget}
              onChange={(e) => setNewPotTarget(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPot()}
            />
            <button
              className="btn btn-primary"
              onClick={addPot}
              disabled={!newPotName.trim() || !newPotTarget || parseFloat(newPotTarget) <= 0}
            >
              + Add Pot
            </button>
          </div>

          {pots.length === 0 ? (
            <p className="pots-empty">No pots yet. Add your first savings goal above.</p>
          ) : (
            pots.map((pot) => (
              <div key={pot.id} className="pot-row">
                <span className="pot-color-dot" style={{ background: pot.color }} />
                <span className="pot-name">{pot.name}</span>
                <span className="pot-target">
                  {currencySymbol(prefs.currency)}{pot.targetAmount.toLocaleString()}
                </span>
                <button
                  className="pot-delete-btn"
                  onClick={() => deletePot(pot.id)}
                  aria-label={`Delete ${pot.name}`}
                >
                  <IcoTrash />
                </button>
              </div>
            ))
          )}
        </Section>

      </div>

      {/* ── Bottom save bar ── */}
      <div className="settings-save-bar">
        <span className="save-bar-left">{savedLabel}</span>
        <div className="save-bar-right">
          <button className="btn btn-ghost" onClick={discardChanges} disabled={!isDirty}>
            Discard Changes
          </button>
          <button className="btn btn-primary" onClick={saveChanges}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;