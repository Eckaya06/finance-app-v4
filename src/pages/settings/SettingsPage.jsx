import { useEffect, useRef, useState } from "react";
import "./SettingsPage.css";
import { transactions as mockTransactions } from "../../data/mockTransactions.js";

const currencySymbol = (c) =>
  c === "TRY" ? "₺" : c === "EUR" ? "€" : "$";

/* ─── INLINE SVG ICONS ───────────────────────────── */
const Ico = ({ d, ...p }) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" {...p}>
    {d}
  </svg>
);

const IcoUser      = () => <Ico d={<><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>} />;
const IcoSun       = () => <Ico d={<><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/></>} />;
const IcoBarChart  = () => <Ico d={<><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></>} />;
const IcoDatabase  = () => <Ico d={<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></>} />;
const IcoBell      = () => <Ico d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>} />;
const IcoGlobe     = () => <Ico d={<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>} />;
const IcoCog       = () => <Ico d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>} />;
const IcoStar      = () => <Ico d={<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>} />;
const IcoKey       = () => <Ico d={<><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></>} />;
const IcoTrash     = () => <Ico d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></>} />;
const IcoRefresh   = () => <Ico d={<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></>} />;
const IcoCheck     = () => <Ico d={<><polyline points="20 6 9 17 4 12"/></>} />;

/* ─── Toggle ── */
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

/* ─── Section card ── */
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

/* ─── Setting row ── */
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
  const [profile, setProfile] = useState({ displayName: "", email: "" });
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("settings") || "{}");
      const theme = saved.prefs?.theme || "light";
      if (theme === "dark") document.body.classList.add("theme-dark");
      else document.body.classList.remove("theme-dark");
      return {
        theme,
        currency: "TRY",
        priceDecimals: 4,
        favoriteMetals: ["Gold"],
        compactView: false,
        showSparklines: true,
      };
    } catch {
      return {
        theme: "light",
        currency: "TRY",
        priceDecimals: 4,
        favoriteMetals: ["Gold"],
        compactView: false,
        showSparklines: true,
      };
    }
  });
  const [dataMgmt, setDataMgmt] = useState({ apiKey: "" });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const dirtyCount  = useRef(0);
  const avatarFileRef = useRef(null);

  /* ── load ── */
  useEffect(() => {
    const saved = localStorage.getItem("settings");
    if (!saved) return;
    try {
      const s = JSON.parse(saved);
      if (s.profile)       setProfile(s.profile);
      if (s.prefs)         setPrefs((d) => ({ ...d, ...s.prefs, favoriteMetals: Array.isArray(s.prefs.favoriteMetals) ? s.prefs.favoriteMetals : d.favoriteMetals }));
      if (s.dataMgmt)      setDataMgmt(s.dataMgmt);
      if (s.notificationsEnabled !== undefined) setNotificationsEnabled(s.notificationsEnabled);
      if (s.lastSaved)     setLastSaved(s.lastSaved);
    } catch {}
  }, []);

  /* ── track dirty ── */
  useEffect(() => {
    if (dirtyCount.current < 2) { dirtyCount.current++; return; }
    setIsDirty(true);
  }, [profile, prefs, dataMgmt, notificationsEnabled]);

  /* ── dark mode ── */
  useEffect(() => {
    if (prefs.theme === "dark") document.body.classList.add("theme-dark");
    else document.body.classList.remove("theme-dark");
  }, [prefs.theme]);

  /* ── save ── */
  const saveChanges = () => {
    const now = new Date().toISOString();
    localStorage.setItem("settings", JSON.stringify({
      profile, prefs, dataMgmt, notificationsEnabled, lastSaved: now,
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
      if (s.notificationsEnabled !== undefined) setNotificationsEnabled(s.notificationsEnabled);
    } catch {}
    setIsDirty(false);
  };

  const setPref = (k, v) => {
    setPrefs((p) => ({ ...p, [k]: v }));
    if (k === "theme") {
      try {
        const saved = JSON.parse(localStorage.getItem("settings") || "{}");
        saved.prefs = { ...(saved.prefs || {}), theme: v };
        localStorage.setItem("settings", JSON.stringify(saved));
      } catch {}
    }
  };

  const setDM = (k, v) => setDataMgmt((d) => ({ ...d, [k]: v }));

  /* ── notification toggle ── */
  const handleNotifToggle = async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
      if (result !== "granted") return;
    }
    if (Notification.permission === "denied") return;
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    if (next) {
      setTimeout(() => new Notification("🔔 Notifications Enabled", {
        body: "You will now receive app notifications.",
        icon: "/favicon.ico",
      }), 400);
    }
  };

  /* ── avatar ── */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfile((p) => ({ ...p, avatarUrl: ev.target.result }));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeAvatar = () => setProfile((p) => ({ ...p, avatarUrl: "" }));

  const toggleMetal = (metal) => {
    setPrefs((p) => {
      const metals = p.favoriteMetals ?? [];
      const has = metals.includes(metal);
      return { ...p, favoriteMetals: has ? metals.filter((m) => m !== metal) : [...metals, metal] };
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

  const savedLabel = lastSaved
    ? (() => {
        const mins = Math.round((Date.now() - new Date(lastSaved).getTime()) / 60000);
        if (mins < 1) return "Last saved just now";
        if (mins === 1) return "Last saved 1 minute ago";
        return `Last saved ${mins} minutes ago`;
      })()
    : "Not saved yet";

  return (
    <div className="settings-page">

      {/* ── Top bar ── */}
      <div className="settings-topbar">
        <div>
          <div className="settings-topbar__eyebrow">Preferences</div>
          <h1>Settings</h1>
        </div>
        <div className="topbar-right">
          {isDirty && (
            <span className="unsaved-badge">
              <span className="unsaved-dot" />
              {4} unsaved changes
            </span>
          )}
          <button className="btn btn-primary" onClick={saveChanges}>
            Save Changes
          </button>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="settings-grid">

        {/* Profile */}
        <Section icon={<IcoUser />} title="Profile">
          <div className="profile-avatar-row">
            <div className="avatar-wrapper">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="avatar-img" />
              ) : (
                <div className="avatar-initials">{initials}</div>
              )}
              <button type="button" className="avatar-edit-btn"
                onClick={() => avatarFileRef.current?.click()} title="Change avatar">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
              <input ref={avatarFileRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleAvatarChange} />
            </div>
            <div className="avatar-meta">
              <strong>{profile.displayName || "Your Name"}</strong>
              <span>{profile.email || "—"}</span>
              <div className="avatar-actions">
                <button type="button" className="avatar-link"
                  onClick={() => avatarFileRef.current?.click()}>Change Avatar →</button>
                {profile.avatarUrl && (
                  <button type="button" className="avatar-link avatar-link--remove"
                    onClick={removeAvatar}>Remove</button>
                )}
              </div>
            </div>
          </div>

          <div className="profile-field">
            <label>Email</label>
            <input className="input" value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              placeholder="name@example.com" />
          </div>
        </Section>

        {/* Appearance */}
        <Section icon={<IcoSun />} title="Appearance">
          <div className="theme-cards">
            {["light", "dark"].map((t) => (
              <div key={t} className={`theme-card${prefs.theme === t ? " selected" : ""}`}
                onClick={() => setPref("theme", t)}>
                {prefs.theme === t && <div className="theme-card-check"><IcoCheck /></div>}
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
          <SettingRow icon={<IcoCog />} label="Compact View" sub="Reduce spacing between elements"
            control={<Toggle on={prefs.compactView} onClick={() => setPref("compactView", !prefs.compactView)} />}
          />
          <SettingRow icon={<IcoBarChart />} label="Show Sparklines on Cards" sub="Mini trend charts on currency cards"
            control={<Toggle on={prefs.showSparklines} onClick={() => setPref("showSparklines", !prefs.showSparklines)} />}
          />
        </Section>

        {/* Financial Preferences */}
        <Section icon={<IcoBarChart />} title="Financial Preferences">
          <SettingRow icon={<IcoGlobe />} label="Default Currency" sub="Base for all calculations"
            control={
              <select className="select" value={prefs.currency}
                onChange={(e) => setPref("currency", e.target.value)}>
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            }
          />
          <SettingRow icon={<IcoCog />} label="Price Decimals" sub="Decimal places for rates"
            control={
              <div className="stepper">
                <button className="stepper-btn"
                  onClick={() => setPref("priceDecimals", Math.max(0, prefs.priceDecimals - 1))}>−</button>
                <span className="stepper-val">{prefs.priceDecimals}</span>
                <button className="stepper-btn"
                  onClick={() => setPref("priceDecimals", Math.min(8, prefs.priceDecimals + 1))}>+</button>
              </div>
            }
          />
          <SettingRow icon={<IcoStar />} label="Favorite Metals" sub="Metals shown on dashboard"
            control={
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {["Gold", "Silver", "Platinum"].map((m) => (
                  <button key={m} className={metalClass(m)} onClick={() => toggleMetal(m)}>{m}</button>
                ))}
              </div>
            }
          />
        </Section>

        {/* Data Management */}
        <Section icon={<IcoDatabase />} title="Data Management">
          <SettingRow icon={<IcoKey />} label="API Key" sub="GoldAPI key for metal prices" control={null} />
          <div className="api-key-row">
            <input className="api-key-input" type={showApiKey ? "text" : "password"}
              value={dataMgmt.apiKey} onChange={(e) => setDM("apiKey", e.target.value)}
              placeholder="Enter your GoldAPI key…" />
            <button className="api-key-show-btn" onClick={() => setShowApiKey((s) => !s)}>
              {showApiKey ? "Hide" : "Show"}
            </button>
          </div>
          <div className="data-actions">
            <button className="data-action-btn" onClick={clearCache}>
              <IcoTrash /> Clear Cache &amp; History
            </button>
            <button className="data-action-btn danger" onClick={resetAll}>
              <IcoRefresh /> Reset All Data
            </button>
          </div>
        </Section>

        {/* Notifications — tek switch */}
        <Section icon={<IcoBell />} title="Notifications" fullWidth>
          {notifPermission === "denied" && (
            <div className="notif-banner notif-banner--warn">
              ⚠️ Browser notifications are blocked. Click the lock icon in the address bar to allow.
            </div>
          )}
          {notifPermission === "unsupported" && (
            <div className="notif-banner notif-banner--warn">
              ⚠️ This browser does not support notifications.
            </div>
          )}
          <SettingRow
            icon={<IcoBell />}
            label="Enable Notifications"
            sub="Receive alerts and updates from the app"
            control={
              <Toggle
                on={notificationsEnabled}
                onClick={handleNotifToggle}
                disabled={notifPermission === "denied" || notifPermission === "unsupported"}
              />
            }
          />
        </Section>

      </div>

      {/* ── Bottom save bar ── */}
      <div className={`settings-save-bar${isDirty ? " settings-save-bar--visible" : ""}`}>
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