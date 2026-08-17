import React, { useState, useEffect } from "react";
import PermissionGuard from "../components/PermissionGuard";
import "../styles/settings.css";
import "../styles/animations.css";

interface SettingsType {
  name:string; email:string; storeName:string; currency:string;
  darkMode:boolean; notifications:boolean;
}

const CURRENCIES: Record<string, [string,string]> = {
  USD:["🇺🇸","US Dollar"],    PKR:["🇵🇰","Pakistani Rupee"],
  EUR:["🇪🇺","Euro"],          GBP:["🇬🇧","British Pound"],
  AED:["🇦🇪","UAE Dirham"],    SAR:["🇸🇦","Saudi Riyal"],
  INR:["🇮🇳","Indian Rupee"],  CAD:["🇨🇦","Canadian Dollar"],
  AUD:["🇦🇺","Australian $"],  JPY:["🇯🇵","Japanese Yen"],
  CNY:["🇨🇳","Chinese Yuan"],  TRY:["🇹🇷","Turkish Lira"],
};

const Settings: React.FC = () => {
  const [s, setS] = useState<SettingsType>(() => {
    const saved = localStorage.getItem("settings");
    const user  = JSON.parse(localStorage.getItem("user") || "{}");
    return saved ? JSON.parse(saved) : {
      name: user.name || "Ibrahim Naeem",
      email: user.email || "admin@gmail.com",
      storeName:"Dashboard Pro Store",
      currency:"PKR", darkMode:false, notifications:true,
    };
  });
  const [saved,  setSaved]  = useState(false);
  const [tab,    setTab]    = useState<"profile"|"store"|"preferences">("profile");

  useEffect(()=>{
    document.body.classList.toggle("dark", s.darkMode);
    localStorage.setItem("settings", JSON.stringify(s));
  },[s]);

  const set = (k: keyof SettingsType, v: any) => setS(p=>({...p,[k]:v}));

  const handleSave = () => {
    localStorage.setItem("settings", JSON.stringify(s));
    const user = JSON.parse(localStorage.getItem("user")||"{}");
    localStorage.setItem("user", JSON.stringify({...user, name:s.name, email:s.email}));
    setSaved(true);
    setTimeout(()=>setSaved(false), 2500);
  };

  return (
    /* 🔒 Only Admins can access Settings */
    <PermissionGuard permission="canAccessSettings" action="access Settings">
      <div className="settings fade-up">

        {/* HEADER */}
        <div className="page-header">
          <div className="page-header-left">
            <h2>Settings</h2>
            <p>Manage your account and store preferences</p>
          </div>
          <button className={`save-btn ${saved?"saved":""}`} onClick={handleSave}>
            {saved
              ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Saved!</>
              : "Save Changes"}
          </button>
        </div>

        {/* TABS */}
        <div className="settings-tabs">
          {(["profile","store","preferences"] as const).map(t=>(
            <button key={t} className={`tab-btn ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
              {t==="profile"&&"👤"} {t==="store"&&"🏪"} {t==="preferences"&&"⚙️"}
              {" "}{t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {/* PROFILE */}
        {tab==="profile"&&(
          <div className="settings-panel fade-up">
            <div className="panel-section">
              <div className="section-label">Account</div>
              <div className="avatar-row">
                <div className="avatar-circle">{s.name.charAt(0)}</div>
                <div><div className="avatar-name">{s.name}</div><div className="avatar-email">{s.email}</div></div>
              </div>
            </div>
            <div className="panel-divider"/>
            <div className="panel-section">
              <div className="section-label">Full Name</div>
              <input value={s.name} onChange={e=>set("name",e.target.value)} className="settings-input" placeholder="Your name"/>
            </div>
            <div className="panel-divider"/>
            <div className="panel-section">
              <div className="section-label">Email Address</div>
              <input value={s.email} onChange={e=>set("email",e.target.value)} className="settings-input" placeholder="you@example.com" type="email"/>
            </div>
          </div>
        )}

        {/* STORE */}
        {tab==="store"&&(
          <div className="settings-panel fade-up">
            <div className="panel-section">
              <div className="section-label">Store Name</div>
              <input value={s.storeName} onChange={e=>set("storeName",e.target.value)} className="settings-input" placeholder="My Store"/>
            </div>
            <div className="panel-divider"/>
            <div className="panel-section">
              <div className="section-label">Currency</div>
              <div className="currency-grid">
                {Object.entries(CURRENCIES).map(([code,[flag,label]])=>(
                  <button key={code} className={`currency-option ${s.currency===code?"selected":""}`}
                    onClick={()=>set("currency",code)}>
                    <span className="currency-flag">{flag}</span>
                    <span className="currency-code">{code}</span>
                    <span className="currency-name">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PREFERENCES */}
        {tab==="preferences"&&(
          <div className="settings-panel fade-up">
            <div className="panel-section">
              <div className="toggle-row">
                <div className="toggle-info">
                  <div className="toggle-icon" style={{background:"var(--brand-dim)",color:"var(--brand)"}}>🌙</div>
                  <div><div className="toggle-label-text">Dark Mode</div><div className="toggle-label-sub">Switch to dark theme</div></div>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={s.darkMode} onChange={e=>set("darkMode",e.target.checked)}/>
                  <span className="slider"/>
                </label>
              </div>
            </div>
            <div className="panel-divider"/>
            <div className="panel-section">
              <div className="toggle-row">
                <div className="toggle-info">
                  <div className="toggle-icon" style={{background:"var(--amber-dim)",color:"var(--amber)"}}>🔔</div>
                  <div><div className="toggle-label-text">Notifications</div><div className="toggle-label-sub">Order & system alerts</div></div>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={s.notifications} onChange={e=>set("notifications",e.target.checked)}/>
                  <span className="slider"/>
                </label>
              </div>
            </div>
            <div className="panel-divider"/>
            <div className="panel-section">
              <div className="section-label">Danger Zone</div>
              <p className="danger-zone-text">Reset all settings to factory defaults. This cannot be undone.</p>
              <button className="reset-btn" onClick={()=>setS({name:"Ibrahim Naeem",email:"admin@gmail.com",storeName:"Dashboard Pro Store",currency:"PKR",darkMode:false,notifications:true})}>
                🔄 Reset to Defaults
              </button>
            </div>
          </div>
        )}

      </div>
    </PermissionGuard>
  );
};
export default Settings;
