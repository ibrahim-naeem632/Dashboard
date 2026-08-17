import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import { validators } from "../utils/validate";
import "../styles/login.css";

interface Errs { email?:string; password?:string; general?:string; }

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [errors,   setErrors]   = useState<Errs>({});
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Clear any stale session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user  = localStorage.getItem("user");
    if (user && !token) {
      localStorage.removeItem("user");
    }
  }, []);

  const validate = (): boolean => {
    const e: Errs = {};
    const em = validators.email(email);
    if (em) e.email = em;
    if (!password) e.password = "Password is required";
    else if (password.length < 4) e.password = "Minimum 4 characters";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true); setErrors({});

    try {
      // Try backend
      const data = await authApi.login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      navigate("/", { replace: true });
    } catch {
      // Offline fallback — only for demo credentials
      if (email === "admin@gmail.com" && password === "1234") {
        // Create a signed-looking token that won't expire for 7 days
        const header  = btoa(JSON.stringify({ alg:"HS256", typ:"JWT" }));
        const payload = btoa(JSON.stringify({
          id:"u1", email, role:"admin",
          exp: Math.floor(Date.now()/1000) + 7*24*3600,
        }));
        const fakeToken = `${header}.${payload}.offline`;
        localStorage.setItem("token", fakeToken);
        localStorage.setItem("user",  JSON.stringify({
          id:"u1", name:"Ibrahim Naeem", email, role:"admin",
        }));
        navigate("/", { replace: true });
      } else {
        setErrors({ general:"Invalid email or password" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* LEFT — BRAND */}
      <div className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 className="brand-title">Dashboard Pro</h2>
          <p className="brand-desc">
            Manage your store, track analytics, and grow your business — all in one place.
          </p>
          <div className="brand-stats">
            {[
              { icon:"📦", val:"1,320", label:"Orders this month" },
              { icon:"💰", val:"$24,500", label:"Revenue generated" },
              { icon:"👥", val:"890", label:"Active customers" },
            ].map(s => (
              <div className="brand-stat" key={s.label}>
                <span className="brand-stat-icon">{s.icon}</span>
                <div>
                  <div className="brand-stat-val">{s.val}</div>
                  <div className="brand-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — FORM */}
      <div className="login-form-side">
        <div className="login-form-wrap">
          <div className="login-header">
            <h1>Welcome back</h1>
            <p>Sign in to your dashboard account</p>
          </div>

          {errors.general && (
            <div className="error-banner">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* EMAIL */}
            <div className={`field ${errors.email ? "has-error" : ""}`}>
              <label>Email Address</label>
              <div className="input-wrap">
                <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 4l-10 8L2 4"/>
                </svg>
                <input
                  type="email" placeholder="admin@gmail.com" value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email:undefined, general:undefined})); }}
                  autoComplete="email" autoFocus
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {/* PASSWORD */}
            <div className={`field ${errors.password ? "has-error" : ""}`}>
              <label>Password</label>
              <div className="input-wrap">
                <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPass ? "text" : "password"} placeholder="••••••••" value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password:undefined, general:undefined})); }}
                  autoComplete="current-password"
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                  {showPass
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox"/>
                <span className="checkmark"/>
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link" onClick={e => e.preventDefault()}>Forgot password?</a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="spinner"/> : "Sign In →"}
            </button>
          </form>

          <div className="login-hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Demo: <code>admin@gmail.com</code> / <code>1234</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
