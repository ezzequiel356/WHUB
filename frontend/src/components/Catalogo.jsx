import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Catalogo.css';
import '../styles/Login.css';

const PROGENITOR_MAP = {
  'Baruuk': 'Impacto', 'Dante': 'Impacto', 'Gauss': 'Impacto',
  'Grendel': 'Impacto', 'Rhino': 'Impacto', 'Sevagoth': 'Impacto',
  'Wukong': 'Impacto', 'Zephyr': 'Impacto',
  'Chroma': 'Calor', 'Ember': 'Calor', 'Inaros': 'Calor',
  'Jade': 'Calor', 'Kullervo': 'Calor', 'Nezha': 'Calor',
  'Protea': 'Calor', 'Temple': 'Calor', 'Uriel': 'Calor',
  'Vauban': 'Calor', 'Wisp': 'Calor',
  'Frost': 'Frío', 'Gara': 'Frío', 'Hildryn': 'Frío',
  'Koumei': 'Frío', 'Revenant': 'Frío', 'Styanax': 'Frío',
  'Titania': 'Frío', 'Trinity': 'Frío',
  'Banshee': 'Electricidad', 'Caliban': 'Electricidad', 'Excalibur': 'Electricidad',
  'Follie': 'Electricidad', 'Gyre': 'Electricidad', 'Limbo': 'Electricidad',
  'Nova': 'Electricidad', 'Valkyr': 'Electricidad', 'Volt': 'Electricidad',
  'Atlas': 'Toxina', 'Dagath': 'Toxina', 'Ivara': 'Toxina',
  'Khora': 'Toxina', 'Nekros': 'Toxina', 'Nidus': 'Toxina',
  'Nokko': 'Toxina', 'Oberon': 'Toxina', 'Oraxia': 'Toxina', 'Saryn': 'Toxina',
  'Citrine': 'Magnético', 'Cyte-09': 'Magnético', 'Harrow': 'Magnético',
  'Hydroid': 'Magnético', 'Lavos': 'Magnético', 'Mag': 'Magnético',
  'Mesa': 'Magnético', 'Xaku': 'Magnético', 'Yareli': 'Magnético',
  'Ash': 'Radiación', 'Equinox': 'Radiación', 'Garuda': 'Radiación',
  'Loki': 'Radiación', 'Mirage': 'Radiación', 'Nyx': 'Radiación',
  'Octavia': 'Radiación', 'Qorvex': 'Radiación', 'Voruna': 'Radiación',
};

const PROGENITORES = [
  { id: 'Impacto',      label: 'Impacto',      dot: '#c88050', icon: 'fa-burst'         },
  { id: 'Calor',        label: 'Calor',        dot: '#e87040', icon: 'fa-fire-flame-curved' },
  { id: 'Frío',         label: 'Frío',         dot: '#50b4dc', icon: 'fa-snowflake'      },
  { id: 'Electricidad', label: 'Electricidad', dot: '#c8c850', icon: 'fa-bolt'           },
  { id: 'Toxina',       label: 'Toxina',       dot: '#80d040', icon: 'fa-flask'          },
  { id: 'Magnético',    label: 'Magnético',    dot: '#b450dc', icon: 'fa-magnet'         },
  { id: 'Radiación',    label: 'Radiación',    dot: '#c8a028', icon: 'fa-radiation'      },
];

const ROLES = [
  { id: 'Sigilo',                label: 'Sigilo',                dot: '#80d040', icon: 'fa-mask'          },
  { id: 'Daño',                  label: 'Daño',                  dot: '#e87040', icon: 'fa-dagger'        },
  { id: 'Supervivencia',         label: 'Supervivencia',         dot: '#4ab3d6', icon: 'fa-shield-halved' },
  { id: 'Control de Multitudes', label: 'Control de Multitudes', dot: '#b450dc', icon: 'fa-expand'        },
  { id: 'Soporte',               label: 'Soporte',               dot: '#c8a96e', icon: 'fa-heart-pulse'   },
];

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const FILTERS = [
  { id: 'all',    label: 'Todos',        icon: 'fa-border-all'       },
  { id: 'letra',  label: 'A–Z',          icon: 'fa-arrow-down-a-z'   },
  { id: 'prog',   label: 'Progenitor',   icon: 'fa-atom'             },
  { id: 'rol',    label: 'Rol',          icon: 'fa-user-shield'       },
  { id: 'prime',  label: 'Prime',        icon: 'fa-star'              },
];

function Card({ wf, isFav, onToggleFav }) {
  const navigate = useNavigate();
  return (
    <div
      className={`card-wf${wf.tienePrime && wf.imagenPrime ? ' card-wf--prime' : ''}`}
      onClick={() => navigate(`/warframe/${wf.id}`)}
    >
      <div className="card__img-wrap">
        <img
          className="card__img"
          src={wf.imagen}
          alt={wf.nombre}
          onError={e => e.target.style.display = 'none'}
        />
        {wf.tienePrime && wf.imagenPrime && (
          <img
            className="card__img card__img--prime"
            src={wf.imagenPrime}
            alt={`${wf.nombre} Prime`}
            onError={e => e.target.style.display = 'none'}
          />
        )}
      </div>
      <div className="card__overlay"></div>
      {wf.tienePrime && <div className="card__prime-badge">PRIME</div>}
      <button
        className={`card__fav-btn ${isFav ? 'active' : ''}`}
        onClick={e => { e.stopPropagation(); onToggleFav(wf.nombre); }}
        title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <i className={`${isFav ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
      </button>
      <div className="card__label">
        <span>{wf.nombre.toUpperCase()}</span>
      </div>
    </div>
  );
}

export default function Catalogo() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [warframes, setWarframes]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [busqueda, setBusqueda]       = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab]     = useState('all');
  const [favoritos, setFavoritos]     = useState(new Set());
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [filtroLetra, setFiltroLetra]           = useState('');
  const [filtroProgenitor, setFiltroProgenitor] = useState('');
  const [filtroRol, setFiltroRol]               = useState('');
  const [filtroPrime, setFiltroPrime]           = useState('');

  useEffect(() => {
    fetch('/api/warframes')
      .then(r => r.json())
      .then(data => {
        setWarframes(data.map(wf => ({
          ...wf,
          progenitor: wf.progenitor || PROGENITOR_MAP[wf.nombre] || 'Desconocido'
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/favoritos/${user.id_usuario}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data))
          setFavoritos(new Set(data.map(f => f.warframe_nombre)));
      })
      .catch(() => {});
  }, [user]);

  const handleToggleFav = useCallback(async (nombre) => {
    if (!user) { setShowLoginPopup(true); return; }
    const esFav = favoritos.has(nombre);
    try {
      const res = await fetch('/api/favoritos', {
        method: esFav ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: user.id_usuario, warframe_nombre: nombre }),
      });
      if (!res.ok) {
        const data = await res.json();
        console.error('Error favorito:', data.error);
        return;
      }
      setFavoritos(prev => {
        const next = new Set(prev);
        esFav ? next.delete(nombre) : next.add(nombre);
        return next;
      });
    } catch (e) {
      console.error('Error favorito:', e);
    }
  }, [user, favoritos]);

  const toggle = (val, setter, current) =>
    setter(current === val ? '' : val);

  const resetSub = () => {
    setFiltroLetra('');
    setFiltroProgenitor('');
    setFiltroRol('');
    setFiltroPrime('');
  };

  const handleTab = (id) => {
    setActiveTab(id);
  };

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return warframes.filter(wf => {
      const matchQ    = !q || wf.nombre.toLowerCase().includes(q);
      const matchLetra = !filtroLetra || wf.nombre[0].toUpperCase() === filtroLetra;
      const matchProg  = !filtroProgenitor || wf.progenitor === filtroProgenitor;
      const roles      = Array.isArray(wf.rol) ? wf.rol : (wf.rol ? [wf.rol] : []);
      const matchRol   = !filtroRol || roles.some(r => r.toLowerCase() === filtroRol.toLowerCase());
      const matchPrime = filtroPrime === '' ? true
        : filtroPrime === 'si' ? wf.tienePrime : !wf.tienePrime;
      return matchQ && matchLetra && matchProg && matchRol && matchPrime;
    });
  }, [warframes, busqueda, filtroLetra, filtroProgenitor, filtroRol, filtroPrime]);

  // Agrupa según el tab activo
  const agrupados = useMemo(() => {
    if (activeTab === 'all' || activeTab === 'letra') {
      return filtrados.reduce((acc, wf) => {
        const k = wf.nombre[0].toUpperCase();
        if (!acc[k]) acc[k] = { label: k, dot: '#c8a96e', items: [] };
        acc[k].items.push(wf);
        return acc;
      }, {});
    }
    if (activeTab === 'prog') {
      const acc = {};
      PROGENITORES.forEach(p => { acc[p.id] = { label: p.label, dot: p.dot, items: [] }; });
      filtrados.forEach(wf => {
        if (acc[wf.progenitor]) acc[wf.progenitor].items.push(wf);
      });
      return acc;
    }
    if (activeTab === 'rol') {
      const acc = {};
      ROLES.forEach(r => { acc[r.id] = { label: r.label, dot: r.dot, items: [] }; });
      filtrados.forEach(wf => {
        const roles = Array.isArray(wf.rol) ? wf.rol : (wf.rol ? [wf.rol] : []);
        const rolesToShow = filtroRol
          ? roles.filter(r => r.toLowerCase() === filtroRol.toLowerCase())
          : roles;
        rolesToShow.forEach(r => { if (acc[r]) acc[r].items.push(wf); });
      });
      return acc;
    }
    if (activeTab === 'prime') {
      return {
        'si': { label: 'Con Prime',  dot: '#e8c060', items: filtrados.filter(w => w.tienePrime) },
        'no': { label: 'Sin Prime',  dot: '#4a6880', items: filtrados.filter(w => !w.tienePrime) },
      };
    }
    return {};
  }, [filtrados, activeTab, filtroRol]);

  const hayFiltroSub = filtroLetra || filtroProgenitor || filtroRol || filtroPrime;

  return (
    <>
      {/* POPUP LOGIN */}
      {showLoginPopup && (
        <div className="fav-popup__overlay" onClick={() => setShowLoginPopup(false)}>
          <div className="fav-popup" onClick={e => e.stopPropagation()}>
            <i className="fa-solid fa-heart fav-popup__icon"></i>
            <p className="fav-popup__title">Inicia sesión para usar esta función</p>
            <p className="fav-popup__sub">Guardá tus warframes favoritos y accedé a ellos desde tu perfil.</p>
            <div className="fav-popup__btns">
              <button className="fav-popup__btn fav-popup__btn--primary" onClick={() => navigate('/login', { state: { from: location.pathname } })}>
                Iniciar sesión
              </button>
              <button className="fav-popup__btn fav-popup__btn--secondary" onClick={() => setShowLoginPopup(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="cat-nav">
        <img
          src="/Home/WarframeLogo.png"
          alt="Logo"
          className="cat-nav__logo"
          onClick={() => navigate('/')}
        />
        {user ? (
          <div className="profile-wrapper">
            <div className="profile-avatar">
              <i className="fa-solid fa-user"></i>
            </div>
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

      {/* BARRA STICKY */}
      <div className="cat-bar--root">

        {/* Búsqueda */}
        <div className="cat-bar__search--wrap">
          <i className="fa-solid fa-magnifying-glass cat-bar__search--icon"></i>
          <input
            className="cat-bar__search--input"
            type="text"
            placeholder="Buscar warframe..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            autoComplete="off"
          />
          {busqueda && (
            <button className="cat-bar__search--clear" onClick={() => setBusqueda('')}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
          <button
            className={`cat-bar__filters-btn ${filtersOpen ? 'active' : ''}`}
            onClick={() => setFiltersOpen(o => !o)}
          >
            <i className="fa-solid fa-sliders"></i>
            Filtros
            <i className={`fa-solid fa-chevron-${filtersOpen ? 'up' : 'down'} cat-bar__filters-chevron`}></i>
          </button>
        </div>

        {/* Tabs de filtro */}
        {filtersOpen && (
          <div className="cat-bar__tabs--wrap">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`cat-bar__tab ${activeTab === f.id ? 'active' : ''}`}
                onClick={() => handleTab(f.id)}
              >
                <i className={`fa-solid ${f.icon}`}></i>
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Sub-filtros según tab */}
        {activeTab === 'letra' && (
          <div className="cat-bar__sub--wrap">
            {LETRAS.map(l => (
              <button
                key={l}
                className={`cat-chip cat-chip--letra ${filtroLetra === l ? 'active' : ''}`}
                onClick={() => toggle(l, setFiltroLetra, filtroLetra)}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'prog' && (
          <div className="cat-bar__sub--wrap">
            {PROGENITORES.map(p => (
              <button
                key={p.id}
                className={`cat-chip cat-chip--prog ${filtroProgenitor === p.id ? 'active' : ''}`}
                style={filtroProgenitor === p.id
                  ? { borderColor: p.dot, color: p.dot, background: `${p.dot}18` }
                  : {}}
                onClick={() => toggle(p.id, setFiltroProgenitor, filtroProgenitor)}
              >
                <i className={`fa-solid ${p.icon}`}></i>
                {p.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'rol' && (
          <div className="cat-bar__sub--wrap">
            {ROLES.map(r => (
              <button
                key={r.id}
                className={`cat-chip cat-chip--rol ${filtroRol === r.id ? 'active' : ''}`}
                style={filtroRol === r.id
                  ? { borderColor: r.dot, color: r.dot, background: `${r.dot}18` }
                  : {}}
                onClick={() => toggle(r.id, setFiltroRol, filtroRol)}
              >
                <i className={`fa-solid ${r.icon}`}></i>
                {r.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'prime' && (
          <div className="cat-bar__sub--wrap">
            {[
              { val: 'si', label: 'Con Prime', dot: '#e8c060', icon: 'fa-star' },
              { val: 'no', label: 'Sin Prime', dot: '#4a6880', icon: 'fa-star-half-stroke' },
            ].map(opt => (
              <button
                key={opt.val}
                className={`cat-chip ${filtroPrime === opt.val ? 'active' : ''}`}
                style={filtroPrime === opt.val
                  ? { borderColor: opt.dot, color: opt.dot, background: `${opt.dot}18` }
                  : {}}
                onClick={() => toggle(opt.val, setFiltroPrime, filtroPrime)}
              >
                <i className={`fa-solid ${opt.icon}`}></i>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Contador + limpiar */}
        <div className="cat-bar__meta--wrap">
          <span className="cat-bar__count">
            <span>{filtrados.length}</span>
            {' '}warframe{filtrados.length !== 1 ? 's' : ''}
            {(busqueda || hayFiltroSub) ? ' encontrados' : ' registrados'}
          </span>
          {(busqueda || hayFiltroSub) && (
            <button className="cat-bar__reset" onClick={() => { setBusqueda(''); resetSub(); }}>
              <i className="fa-solid fa-rotate-left"></i> Limpiar
            </button>
          )}
        </div>

      </div>

      {/* CONTENIDO */}
      <main className="cat-main">
        {loading && <div className="cat-state">Cargando warframes...</div>}
        {!loading && filtrados.length === 0 && (
          <div className="cat-state">
            <i className="fa-solid fa-circle-xmark"></i>
            <p>No se encontraron warframes</p>
          </div>
        )}
        {!loading && Object.entries(agrupados)
          .filter(([, g]) => g.items.length > 0)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, grupo]) => (
            <section key={key} className="cat-section">
              <div className="cat-section__header">
                <div
                  className="cat-section__dot"
                  style={{ background: grupo.dot }}
                ></div>
                <h2 className="cat-section__title">{grupo.label}</h2>
                <span className="cat-section__count">
                  {grupo.items.length} warframe{grupo.items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="cat-grupo__cards--wrap">
                {grupo.items.map(wf => (
                  <Card
                    key={wf.nombre}
                    wf={wf}
                    isFav={favoritos.has(wf.nombre)}
                    onToggleFav={handleToggleFav}
                  />
                ))}
              </div>
            </section>
          ))
        }
      </main>
    </>
  );
}