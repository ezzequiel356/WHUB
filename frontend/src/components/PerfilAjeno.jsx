import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavUserSearch from './NavUserSearch';
import '../styles/Perfil.css';
import '../styles/Login.css';

export default function PerfilAjeno() {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [perfil, setPerfil]     = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`/api/usuarios/${username}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setPerfil(data); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [username]);

  useEffect(() => {
    if (!perfil) return;
    fetch(`/api/favoritos/${perfil.id_usuario}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setFavoritos(data); })
      .catch(() => {});
  }, [perfil]);

  const nombreCompleto = perfil ? [perfil.nombre, perfil.apellido].filter(Boolean).join(' ') : '';
  const inicial = perfil ? (perfil.nombre || 'U').charAt(0).toUpperCase() : 'U';

  return (
    <div className="pf-root">

      {/* NAV */}
      <nav className="pf-nav">
        <span className="pf-nav__logo" onClick={() => navigate('/')}>WARFRAME HUB</span>
        <NavUserSearch />
        {user ? (
          <div className="profile-wrapper">
            <div className="profile-avatar"><i className="fa-solid fa-user"></i></div>
            <div className="profile-dropdown">
              <a onClick={() => navigate('/perfil')} style={{ cursor: 'pointer' }}>{user.username}</a>
              <a href="#" onClick={logout}>Cerrar sesión</a>
            </div>
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="btn-login" onClick={() => navigate('/login', { state: { from: location.pathname } })}>Iniciar sesión</button>
            <button className="btn-register" onClick={() => navigate('/registro', { state: { from: location.pathname } })}>Registrarse</button>
          </div>
        )}
      </nav>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#4a6880', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em' }}>
          Cargando perfil...
        </div>
      )}

      {notFound && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#4a6880', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em' }}>
          Usuario no encontrado.
        </div>
      )}

      {/* BOTÓN VOLVER */}
      <div className="pf-back-wrap">
        <button className="pf-back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i> Volver
        </button>
      </div>

      {!loading && perfil && (
        <div className="pf-page">

          {/* BANNER */}
          <div className="pf-banner">
            <div className="pf-banner__pattern"></div>
            {perfil.banner && <img src={perfil.banner} alt="Banner" className="pf-banner__img" />}
          </div>

          {/* PROFILE TOP */}
          <div className="pf-top">
            <div className="pf-avatar">
              {perfil.avatar
                ? <img src={perfil.avatar} alt="Avatar" />
                : <div className="pf-avatar__inicial">{inicial}</div>
              }
            </div>
          </div>

          {/* NOMBRE / USERNAME */}
          <div className="pf-info">
            <div className="pf-info__name">{nombreCompleto}</div>
            <div className="pf-info__username">@{perfil.username}</div>
          </div>

          {/* SOBRE MÍ */}
          <div className="pf-card">
            <div className="pf-card__title">Sobre mí</div>
            <p className="pf-card__bio">
              {perfil.descripcion || <em>Este usuario no escribió nada todavía.</em>}
            </p>
          </div>

          {/* WARFRAMES FAVORITOS */}
          <div className="pf-card">
            <div className="pf-card__title">Warframes favoritos</div>
            {favoritos.length === 0 ? (
              <div className="pf-empty">
                <span className="pf-empty__icon">✦</span>
                <p>Este usuario no tiene favoritos todavía.</p>
              </div>
            ) : (
              <div className="pf-fav-grid">
                {favoritos.map(f => (
                  <div
                    key={f.warframe_nombre}
                    className="pf-fav-item"
                    onClick={() => navigate(`/warframe/${f.warframe_nombre.toLowerCase()}`)}
                  >
                    <div className="pf-fav-placeholder"><i className="fa-solid fa-star"></i></div>
                    <div className="pf-fav-name">{f.warframe_nombre}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
