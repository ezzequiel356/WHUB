import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function WarframeNav({ nombre }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="wf-nav--root">
      <div className="wf-nav__logo--wrap">
        <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          War<span>Frame</span> HUB
        </a>
      </div>
      <div className="wf-nav__breadcrumb--wrap">
        Warframes › <span>{nombre}</span>
      </div>
      {user ? (
        <div className="wf-nav__profile--wrapper">
          <div className="wf-nav__profile--avatar">
            <i className="fa-solid fa-user"></i>
          </div>
          <div className="wf-nav__profile--dropdown">
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
  );
}

export default WarframeNav;