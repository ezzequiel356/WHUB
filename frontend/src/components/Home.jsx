import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'
import '../styles/App.css'


function Home() {

  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <div id="page-content">
        <nav>
          <div id="nav-logo-slot">
            <img src="Home/WarframeLogo.png" alt="Logo" style={{ height: '48px' }}/>
          </div>

          <div className="links">
            <a href="https://wiki.warframe.com/" target="_blank"><img src="Home/warframeicon.png" id="wiki"/>&nbsp;Wiki</a>
            <a href="https://overframe.gg/" target="_blank"><img src="Home/overframe.png"/>&nbsp;Overframe</a>
            <a href="https://warframe.market/" target="_blank"><i className="fa-solid fa-cart-shopping"></i>&nbsp;Market</a>
          </div>

          {/* Botón hamburguesa — solo visible en mobile */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span/><span/><span/>
          </button>

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

          {/* Menú mobile desplegable */}
          <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
            <a href="https://wiki.warframe.com/" target="_blank" onClick={() => setMenuOpen(false)}>
              <img src="Home/warframeicon.png" id="wiki"/>&nbsp;Wiki
            </a>
            <a href="https://overframe.gg/" target="_blank" onClick={() => setMenuOpen(false)}>
              <img src="Home/overframe.png"/>&nbsp;Overframe
            </a>
            <a href="https://warframe.market/" target="_blank" onClick={() => setMenuOpen(false)}>
              <i className="fa-solid fa-cart-shopping"></i>&nbsp;Market
            </a>

            {!user && (
              <div className="mobile-menu__auth">
                <a onClick={() => { setMenuOpen(false); navigate('/login', { state: { from: location.pathname } }); }}>
                  <i className="fa-solid fa-right-to-bracket"></i>&nbsp;Iniciar sesión
                </a>
                <a onClick={() => { setMenuOpen(false); navigate('/registro', { state: { from: location.pathname } }); }}>
                  <i className="fa-solid fa-user-plus"></i>&nbsp;Registrarse
                </a>
              </div>
            )}
          </div>
        </nav>

        <section className="hero">
          <h1>Warframe <span>Hub</span></h1>
          <p>La experiencia completa de Warframe en una sola web: Guía completa, builds meta y precios en tiempo real.</p>
          <button className="hero-cta" onClick={() => navigate('/catalogo')}>Explorar Warframes</button>
        </section>

        <section className="section">
          <div className="cards">
            <div className="card"><h3>Aviso legal</h3><p>Digital Extremes Ltd, Warframe y el logotipo de Warframe son marcas registradas. Todos los derechos están reservados a nivel mundial. Este sitio no tiene ningún vínculo oficial con Digital Extremes Ltd ni con Warframe. Todas las ilustraciones, capturas de pantalla, personajes u otras características reconocibles de la propiedad intelectual relacionadas con estas marcas son asimismo propiedad intelectual de Digital Extremes Ltd.</p></div>
            <div className="card"><h3>Última actualización</h3><p>Esta página fue editada por última vez el 9 de Junio del 2026, a las 0:35.</p></div>
            <div className="card"><a href="https://42bytes.notion.site/WFM-Api-v2-Documentation-5d987e4aa2f74b55a80db1a09932459d" target="_blank"><h3>Documentación API</h3><p>warframe.market®</p></a></div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Home
