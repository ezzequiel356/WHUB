import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NavUserSearch.css';

export default function NavUserSearch() {
  const navigate = useNavigate();
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const wrapRef = useRef();

  /* Cerrar al hacer click fuera */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Buscar con debounce */
  useEffect(() => {
    if (query.length < 3) { setResults([]); setOpen(false); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res  = await fetch(`/api/usuarios/buscar?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (username) => {
    setQuery('');
    setOpen(false);
    setResults([]);
    navigate(`/perfil/${username}`);
  };

  return (
    <div className="nus-wrap" ref={wrapRef}>
      <div className="nus-input-wrap">
        <i className="fa-solid fa-magnifying-glass nus-icon"></i>
        <input
          className="nus-input"
          type="text"
          placeholder="Buscar usuario..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {query && (
          <button className="nus-clear" onClick={() => { setQuery(''); setResults([]); setOpen(false); }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>

      {open && (
        <div className="nus-dropdown">
          {loading && <div className="nus-state">Buscando...</div>}
          {!loading && results.length === 0 && (
            <div className="nus-state">No se encontraron usuarios</div>
          )}
          {!loading && results.map(u => (
            <div key={u.id_usuario} className="nus-item" onClick={() => handleSelect(u.username)}>
              <div className="nus-item__avatar">
                {u.avatar
                  ? <img src={u.avatar} alt={u.username} />
                  : <i className="fa-solid fa-user"></i>
                }
              </div>
              <div className="nus-item__info">
                <span className="nus-item__username">@{u.username}</span>
                <span className="nus-item__name">{u.nombre} {u.apellido}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
