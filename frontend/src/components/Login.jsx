import { useState } from "react";
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import "../styles/Login.css";

/* ── Logo Warframe ── */
function WarframeLogo() {
  return (
    <img
      className="wf-logo"
      src="/Home/WarframeLogo.png"
      alt="Warframe"
    />
  );
}

/* ── Campo de formulario reutilizable ── */
function Field({ label, type = "text", placeholder, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div className="wf-field">
      <label>{label}</label>
      <div className="wf-input-wrap">
        <input
          type={isPass && show ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        {isPass && (
          <button
            type="button"
            className="wf-eye"
            onClick={() => setShow(s => !s)}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
        <span className="wf-input-bar" />
      </div>
    </div>
  );
}

/* ── Panel de Login ── */
function LoginPanel({ onSubmit, loading, error }) {
  const [username,   setUsername]   = useState("");
  const [contraseña, setContraseña] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ username, contraseña });
  }

  return (
    <form className="wf-form" onSubmit={handleSubmit} noValidate>
      <h2 className="wf-form-title">INICIO DE SESIÓN</h2>

      {error && <div className="wf-alert wf-alert--error">{error}</div>}

      <Field
        label="USERNAME"
        placeholder="tu_username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        autoComplete="username"
      />
      <Field
        label="CONTRASEÑA"
        type="password"
        placeholder="••••••••"
        value={contraseña}
        onChange={e => setContraseña(e.target.value)}
        autoComplete="current-password"
      />

      <button className={`wf-btn${loading ? " wf-btn--loading" : ""}`} type="submit" disabled={loading}>
        <span className="wf-btn-text">{loading ? "VERIFICANDO..." : "ACCEDER"}</span>
      </button>
    </form>
  );
}

/* ── Panel de Registro ── */
function RegisterPanel({ onSubmit, loading, error }) {
  const [nombre,     setNombre]     = useState("");
  const [apellido,   setApellido]   = useState("");
  const [username,   setUsername]   = useState("");
  const [email,      setEmail]      = useState("");
  const [contraseña, setContraseña] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ nombre, apellido, username, email, contraseña });
  }

  return (
    <form className="wf-form" onSubmit={handleSubmit} noValidate>
      <h2 className="wf-form-title">CREAR CUENTA</h2>

      {error && <div className="wf-alert wf-alert--error">{error}</div>}

      <div className="wf-row">
        <Field
          label="NOMBRE"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          autoComplete="given-name"
        />
        <Field
          label="APELLIDO"
          placeholder="Apellido"
          value={apellido}
          onChange={e => setApellido(e.target.value)}
          autoComplete="family-name"
        />
      </div>
      <Field
        label="USERNAME"
        placeholder="tu_username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        autoComplete="username"
      />
      <Field
        label="EMAIL"
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        autoComplete="email"
      />
      <Field
        label="CONTRASEÑA"
        type="password"
        placeholder="••••••••"
        value={contraseña}
        onChange={e => setContraseña(e.target.value)}
        autoComplete="new-password"
      />

      <button className={`wf-btn${loading ? " wf-btn--loading" : ""}`} type="submit" disabled={loading}>
        <span className="wf-btn-text">{loading ? "REGISTRANDO..." : "REGISTRARSE"}</span>
      </button>
    </form>
  );
}

/* ── Componente principal ── */
export default function Login() {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.pathname === '/registro');
  const [loginLoading,    setLoginLoading]    = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginError,      setLoginError]      = useState("");
  const [registerError,   setRegisterError]   = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  /* Llamada al endpoint de login (sp_login) */
  async function handleLogin({ username, contraseña }) {
    if (!username || !contraseña) {
        setLoginError("Completá todos los campos.");
        return;
    }
    setLoginError("");
    setLoginLoading(true);
    try {
        const res  = await fetch("/api/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, contraseña }),
        });
        const data = await res.json();
        if (!res.ok) {
        setLoginError(data.error || "Usuario o contraseña incorrectos.");
        return;
        }
        login(data.usuario);
        const from = location.state?.from || '/';
        navigate(from, { replace: true });
        } catch {
            setLoginError("No se pudo conectar con el servidor.");
        } finally {
            setLoginLoading(false);
        }
    }

  /* Llamada al endpoint de registro (sp_registrar_usuario) */
  async function handleRegister({ nombre, apellido, username, email, contraseña }) {
    if (!nombre || !apellido || !username || !email || !contraseña) {
      setRegisterError("Completá todos los campos.");
      return;
    }
    setRegisterError("");
    setRegisterLoading(true);
    try {
      const res  = await fetch("/api/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ nombre, apellido, username, email, contraseña }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error || "Error al registrarse.");
        return;
      }
      /* Registro exitoso: volvemos al login */
      setIsRegister(false);
      setRegisterError("");
    } catch {
      setRegisterError("No se pudo conectar con el servidor.");
    } finally {
      setRegisterLoading(false);
    }
  }

  return (
    <div className="wf-root">
      <div className={`wf-card${isRegister ? " wf-card--register" : ""}`}>

        {/* Panel izquierdo: LOGIN */}
        <div className="wf-panel wf-panel--login">
          <LoginPanel
            onSubmit={handleLogin}
            loading={loginLoading}
            error={loginError}
          />
        </div>

        {/* Panel derecho (fijo): REGISTRO */}
        <div className="wf-panel wf-panel--register">
          <RegisterPanel
            onSubmit={handleRegister}
            loading={registerLoading}
            error={registerError}
          />
        </div>

        {/* Panel deslizante: BRAND */}
        <div className="wf-panel wf-panel--brand">
          <div className="wf-brand-content">
            <WarframeLogo />
            <p className="wf-brand-name">WARFRAME HUB</p>
            <p className="wf-brand-sub">OPERADOR IDENTIFICADO</p>
            <div className="wf-divider" />
            <button
              className="wf-brand-btn"
              onClick={() => {
                setIsRegister(r => !r);
                setLoginError("");
                setRegisterError("");
              }}
            >
              {isRegister ? "INICIO DE SESIÓN" : "REGISTRARSE"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}