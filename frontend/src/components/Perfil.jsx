import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavUserSearch from './NavUserSearch';
import '../styles/Perfil.css';
import '../styles/Login.css';

export default function Perfil() {
  const navigate = useNavigate();
  const { user, logout, login } = useAuth();

  const [editing, setEditing]       = useState(false);
  const [favoritos, setFavoritos]   = useState([]);
  const [historial, setHistorial]   = useState([]);
  const [toast, setToast]           = useState(null);

  const [form, setForm] = useState({
    nombre: '', apellido: '', username: '', email: '', descripcion: '',
    contraseñaActual: '', contraseñaNueva: '',
  });

  const [avatarUrl, setAvatarUrl]   = useState('');
  const [bannerUrl, setBannerUrl]   = useState('');

  const avatarInputRef = useRef();
  const bannerInputRef = useRef();

  /* ── Redirigir si no hay sesión ── */
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  /* ── Cargar datos del usuario ── */
  useEffect(() => {
    if (!user) return;
    setAvatarUrl(user.avatar || '');
    setBannerUrl(user.banner || '');
  }, [user]);

  /* ── Cargar favoritos ── */
  useEffect(() => {
    if (!user) return;
    fetch(`/api/favoritos/${user.id_usuario}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setFavoritos(data); })
      .catch(() => {});
  }, [user]);

  /* ── Cargar historial de compras ── */
  useEffect(() => {
    if (!user) return;
    fetch(`/api/historial/${user.id_usuario}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setHistorial(data); })
      .catch(() => {});
  }, [user]);

  /* ── Toast ── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── Entrar en modo edición ── */
  const handleEdit = () => {
    setForm({
      nombre:           user.nombre       || '',
      apellido:         user.apellido     || '',
      username:         user.username     || '',
      email:            user.email        || '',
      descripcion:      user.descripcion  || '',
      contraseñaActual: '',
      contraseñaNueva:  '',
    });
    setEditing(true);
  };

  /* ── Guardar perfil ── */
  const handleSave = async () => {
    try {
      /* Cambio de contraseña — se procesa primero y por separado */
      if (form.contraseñaNueva) {
        if (!form.contraseñaActual) { showToast('Ingresá tu contraseña actual para cambiarla', 'error'); return; }
        const res = await fetch('/api/perfil/contrasena', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_usuario: user.id_usuario, contrasena_actual: form.contraseñaActual, contrasena_nueva: form.contraseñaNueva }),
        });
        const data = await res.json();
        if (!res.ok) { showToast(data.error || 'Contraseña actual incorrecta', 'error'); return; }
      }

      /* Resto de campos — solo los que cambiaron */
      const calls = [];
      if (form.nombre !== user.nombre)
        calls.push(fetch('/api/perfil/nombre',      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_usuario: user.id_usuario, nombre: form.nombre }) }));
      if (form.apellido !== user.apellido)
        calls.push(fetch('/api/perfil/apellido',    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_usuario: user.id_usuario, apellido: form.apellido }) }));
      if (form.username !== user.username)
        calls.push(fetch('/api/perfil/username',    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_usuario: user.id_usuario, username: form.username }) }));
      if (form.email !== user.email)
        calls.push(fetch('/api/perfil/email',       { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_usuario: user.id_usuario, email: form.email }) }));
      if (form.descripcion !== user.descripcion)
        calls.push(fetch('/api/perfil/descripcion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_usuario: user.id_usuario, descripcion: form.descripcion }) }));

      await Promise.all(calls);

      login({ ...user, nombre: form.nombre, apellido: form.apellido, username: form.username, email: form.email, descripcion: form.descripcion });
      showToast('¡Perfil guardado!');
      setEditing(false);
    } catch {
      showToast('No se pudo guardar el perfil', 'error');
    }
  };

  /* ── Avatar ── */
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('id_usuario', user.id_usuario);
    try {
      const res = await fetch('/api/uploads/avatar', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { showToast('Error al subir el avatar', 'error'); return; }
      setAvatarUrl(data.url);
      login({ ...user, avatar: data.url });
      showToast('¡Foto de perfil actualizada!');
    } catch {
      showToast('Error al subir el avatar', 'error');
    }
    e.target.value = '';
  };

  /* ── Banner ── */
  const handleBannerChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('id_usuario', user.id_usuario);
    try {
      const res = await fetch('/api/uploads/banner', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { showToast('Error al subir el banner', 'error'); return; }
      setBannerUrl(data.url);
      login({ ...user, banner: data.url });
      showToast('¡Banner actualizado!');
    } catch {
      showToast('Error al subir el banner', 'error');
    }
    e.target.value = '';
  };

  /* ── Eliminar compra del historial ── */
  const handleRemoveCompra = async (id_compra) => {
    try {
      await fetch('/api/historial', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_compra, id_usuario: user.id_usuario }),
      });
      setHistorial(prev => prev.filter(c => c.id_compra !== id_compra));
      showToast('Compra eliminada del historial');
    } catch {
      showToast('No se pudo eliminar la compra', 'error');
    }
  };

  /* ── Quitar favorito ── */
  const handleRemoveFav = async (warframe_nombre) => {
    try {
      await fetch('/api/favoritos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: user.id_usuario, warframe_nombre }),
      });
      setFavoritos(prev => prev.filter(f => f.warframe_nombre !== warframe_nombre));
      showToast('Favorito eliminado');
    } catch {
      showToast('No se pudo eliminar el favorito', 'error');
    }
  };

  if (!user) return null;

  const nombreCompleto = [user.nombre, user.apellido].filter(Boolean).join(' ') || 'Tu Nombre';
  const inicial = (user.nombre || 'U').charAt(0).toUpperCase();

  return (
    <div className="pf-root">

      {/* NAV */}
      <nav className="pf-nav">
        <span className="pf-nav__logo" onClick={() => navigate('/')}>WARFRAME HUB</span>
        <NavUserSearch />
        <div className="profile-wrapper">
          <div className="profile-avatar">
            <i className="fa-solid fa-user"></i>
          </div>
          <div className="profile-dropdown">
            <a href="#">{user.username}</a>
            <a href="#" onClick={logout}>Cerrar sesión</a>
          </div>
        </div>
      </nav>

      <div className="pf-page">

        {/* BANNER */}
        <div className="pf-banner" onClick={() => editing && bannerInputRef.current.click()}>
          <div className="pf-banner__pattern"></div>
          {bannerUrl && <img src={bannerUrl} alt="Banner" className="pf-banner__img" />}
          {editing && <div className="pf-banner__overlay"><span>✦ Cambiar Banner</span></div>}
        </div>
        <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerChange} />

        {/* PROFILE TOP */}
        <div className="pf-top">
          <div className="pf-avatar" onClick={() => editing && avatarInputRef.current.click()}>
            {avatarUrl
              ? <img src={avatarUrl} alt="Avatar" />
              : <div className="pf-avatar__inicial">{inicial}</div>
            }
            {editing && <div className="pf-avatar__overlay">Cambiar</div>}
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />

          {editing
            ? <button className="pf-edit-btn pf-edit-btn--save" onClick={handleSave}>Guardar Perfil</button>
            : <button className="pf-edit-btn" onClick={handleEdit}>Editar Perfil</button>
          }
        </div>

        {/* NOMBRE / USERNAME */}
        <div className="pf-info">
          {!editing ? (
            <>
              <div className="pf-info__name">{nombreCompleto}</div>
              <div className="pf-info__username">@{user.username}</div>
            </>
          ) : (
            <div className="pf-form">
              <div className="pf-form__row2">
                <div className="pf-field">
                  <label>Nombre</label>
                  <input type="text" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre" />
                </div>
                <div className="pf-field">
                  <label>Apellido</label>
                  <input type="text" value={form.apellido} onChange={e => setForm(p => ({ ...p, apellido: e.target.value }))} placeholder="Apellido" />
                </div>
              </div>
              <div className="pf-field">
                <label>Nombre de usuario</label>
                <input type="text" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="username" />
              </div>
              <div className="pf-field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="tu@email.com" />
              </div>
            </div>
          )}
        </div>

        {/* SOBRE MÍ */}
        <div className="pf-card">
          <div className="pf-card__title">Sobre mí</div>
          {!editing ? (
            <p className="pf-card__bio">
              {user.descripcion || <em>Nada aquí todavía — hacé clic en "Editar Perfil" para agregar algo sobre vos.</em>}
            </p>
          ) : (
            <textarea
              className="pf-textarea"
              value={form.descripcion}
              onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              placeholder="Contale al mundo algo sobre vos…"
            />
          )}
        </div>

        {/* CONTRASEÑA — solo en edición */}
        {editing && (
          <div className="pf-card">
            <div className="pf-card__title">Cambiar contraseña</div>
            <div className="pf-form__row2">
              <div className="pf-field">
                <label>Contraseña actual</label>
                <input type="password" value={form.contraseñaActual} onChange={e => setForm(p => ({ ...p, contraseñaActual: e.target.value }))} placeholder="••••••••" />
              </div>
              <div className="pf-field">
                <label>Nueva contraseña</label>
                <input type="password" value={form.contraseñaNueva} onChange={e => setForm(p => ({ ...p, contraseñaNueva: e.target.value }))} placeholder="••••••••" />
              </div>
            </div>
            <p className="pf-field-hint">Dejá los campos en blanco si no querés cambiar la contraseña.</p>
          </div>
        )}

        {/* WARFRAMES FAVORITOS */}
        <div className="pf-card">
          <div className="pf-card__title">Warframes favoritos</div>
          {favoritos.length === 0 ? (
            <div className="pf-empty">
              <span className="pf-empty__icon">✦</span>
              <p>No tenés favoritos todavía. Agregá warframes desde el <span className="pf-link" onClick={() => navigate('/catalogo')}>Catálogo</span>.</p>
            </div>
          ) : (
            <div className="pf-fav-grid">
              {favoritos.map(f => (
                <div key={f.warframe_nombre} className="pf-fav-item" onClick={() => navigate(`/warframe/${f.warframe_nombre.toLowerCase()}`)}>
                  <button className="pf-fav-remove" onClick={e => { e.stopPropagation(); handleRemoveFav(f.warframe_nombre); }} title="Quitar favorito">✕</button>
                  <div className="pf-fav-placeholder"><i className="fa-solid fa-star"></i></div>
                  <div className="pf-fav-name">{f.warframe_nombre}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HISTORIAL DE COMPRAS */}
        <div className="pf-card">
          <div className="pf-card__title">Historial de compras</div>
          {historial.length === 0 ? (
            <div className="pf-empty">
              <span className="pf-empty__icon">🛒</span>
              <p>No hay compras registradas todavía.</p>
            </div>
          ) : (
            <div className="pf-historial">
              {historial.map(c => (
                <div key={c.id_compra} className="pf-historial__item">
                  <div className="pf-historial__info">
                    <div className="pf-historial__nombre">{c.item_nombre}</div>
                    <div className="pf-historial__meta">
                      <span className="pf-historial__vendedor">
                        <i className="fa-solid fa-user"></i> {c.vendedor}
                      </span>
                      <span className="pf-historial__precio">
                        <span className="pf-historial__plat-icon"></span>
                        {c.precio_platinum} pl
                      </span>
                      <span className="pf-historial__fecha">
                        {new Date(c.fecha_guardado).toLocaleDateString('es-AR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    className="pf-historial__remove"
                    onClick={() => handleRemoveCompra(c.id_compra)}
                    title="Eliminar del historial"
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* TOAST */}
      {toast && (
        <div className={`pf-toast pf-toast--${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

    </div>
  );
}
