import React, { useState, useEffect } from "react";
import "../styles/settings.css";
import "../styles/animations.css";

interface SettingsType {
  name: string;
  email: string;
  storeName: string;
  currency: string;
  darkMode: boolean;
  notifications: boolean;
}

const CURRENCY_LABELS: Record<string, string> = {
  USD: "US Dollar", PKR: "Pakistani Rupee", EUR: "Euro",
  GBP: "British Pound", AED: "UAE Dirham", SAR: "Saudi Riyal",
  INR: "Indian Rupee", CAD: "Canadian Dollar", AUD: "Australian Dollar",
  JPY: "Japanese Yen", CNY: "Chinese Yuan", TRY: "Turkish Lira",
};

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸", PKR: "🇵🇰", EUR: "🇪🇺", GBP: "🇬🇧", AED: "🇦🇪", SAR: "🇸🇦",
  INR: "🇮🇳", CAD: "🇨🇦", AUD: "🇦🇺", JPY: "🇯🇵", CNY: "🇨🇳", TRY: "🇹🇷",
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType>(() => {
    const saved = localStorage.getItem("settings");
    return saved ? JSON.parse(saved) : {
      name: "Ibrahim",
      email: "ibrahim@gmail.com",
      storeName: "My Store",
      currency: "PKR",
      darkMode: false,
      notifications: true,
    };
  });

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "store" | "preferences">("profile");

  useEffect(() => {
    document.body.classList.toggle("dark", settings.darkMode);
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setSettings(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = () => {
    localStorage.setItem("settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div className="settings fade-up">

      {/* HEADER */}
      <div className="settings-header">
        <div>
          <h2>Settings</h2>
          <p>Manage your account and preferences</p>
        </div>
        <button className={`save-btn ${saved ? "saved" : ""}`} onClick={handleSave}>
          {saved ? (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Saved!</>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* TAB NAV */}
      <div className="settings-tabs">
        {(["profile", "store", "preferences"] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "profile" && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            )}
            {tab === "store" && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            )}
            {tab === "preferences" && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            )}
            <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
          </button>
        ))}
      </div>

      {/* CONTENT PANELS */}
      <div className="settings-content">

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="settings-panel fade-up">
            <div className="panel-section">
              <div className="section-label">Avatar</div>
              <div className="avatar-row">
                <div className="avatar-circle">
                  {settings.name.charAt(0).toUpperCase()}
                </div>
                <div className="avatar-info">
                  <span className="avatar-name">{settings.name}</span>
                  <span className="avatar-email">{settings.email}</span>
                </div>
              </div>
            </div>

            <div className="panel-divider" />

            <div className="panel-section">
              <div className="section-label">Full Name</div>
              <input name="name" value={settings.name} onChange={handleChange} className="settings-input" placeholder="Your name" />
            </div>

            <div className="panel-divider" />

            <div className="panel-section">
              <div className="section-label">Email Address</div>
              <input name="email" value={settings.email} onChange={handleChange} className="settings-input" placeholder="you@example.com" />
            </div>
          </div>
        )}

        {/* STORE */}
        {activeTab === "store" && (
          <div className="settings-panel fade-up">
            <div className="panel-section">
              <div className="section-label">Store Name</div>
              <input name="storeName" value={settings.storeName} onChange={handleChange} className="settings-input" placeholder="My Store" />
            </div>

            <div className="panel-divider" />

            <div className="panel-section">
              <div className="section-label">Currency</div>
              <div className="currency-grid">
                {Object.entries(CURRENCY_LABELS).map(([code, label]) => (
                  <button
                    key={code}
                    className={`currency-option ${settings.currency === code ? "selected" : ""}`}
                    onClick={() => setSettings(prev => ({ ...prev, currency: code }))}
                  >
                    <span className="currency-flag">{CURRENCY_FLAGS[code]}</span>
                    <span className="currency-code">{code}</span>
                    <span className="currency-name">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PREFERENCES */}
        {activeTab === "preferences" && (
          <div className="settings-panel fade-up">
            <div className="panel-section">
              <div className="toggle-row">
                <div className="toggle-info">
                  <div className="toggle-icon-wrap dark-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  </div>
                  <div className="toggle-label">
                    <span>Dark Mode</span>
                    <small>Switch to dark theme</small>
                  </div>
                </div>
                <label className="switch">
                  <input type="checkbox" name="darkMode" checked={settings.darkMode} onChange={handleChange} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="panel-divider" />

            <div className="panel-section">
              <div className="toggle-row">
                <div className="toggle-info">
                  <div className="toggle-icon-wrap notif-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  </div>
                  <div className="toggle-label">
                    <span>Notifications</span>
                    <small>Order & system alerts</small>
                  </div>
                </div>
                <label className="switch">
                  <input type="checkbox" name="notifications" checked={settings.notifications} onChange={handleChange} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="panel-divider" />

            <div className="panel-section">
              <div className="section-label">Danger Zone</div>
              <p className="danger-desc">Reset all settings to defaults. This cannot be undone.</p>
              <button className="reset-btn" onClick={() => {
                setSettings({
                  name: "Ibrahim", email: "ibrahim@gmail.com", storeName: "My Store",
                  currency: "PKR", darkMode: false, notifications: true,
                });
              }}>
                Reset to Defaults
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;