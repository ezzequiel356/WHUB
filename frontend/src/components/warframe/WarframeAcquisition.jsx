import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ── Popup: sesión requerida ── */
function LoginRequeridoPopup({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <div
      className="wf-comprar__overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="wf-comprar__popup">
        <button className="wf-comprar__close" onClick={onClose}>✕</button>
        <div className="wf-comprar__title">
          <i className="fa-solid fa-lock"></i> Acceso restringido
        </div>
        <div className="wf-comprar__subtitle">
          Necesitás iniciar sesión para usar el Mercado.
        </div>
        <div className="wf-comprar__divider"></div>
        <div className="wf-comprar__confirm-btns">
          <button
            className="wf-comprar__btn--yes"
            onClick={() => { onClose(); navigate('/login', { state: { from: location.pathname } }); }}
          >
            <i className="fa-solid fa-right-to-bracket"></i> Iniciar sesión
          </button>
          <button className="wf-comprar__btn--no" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i> Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Popup de compra ── */
function ComprarPopup({ parte, slug, precio, vendedor, estado, warframe, userId, onClose }) {
  const mensaje = `/w ${vendedor} Hi! I want to buy: "${parte}" for ${precio} platinum. (warframe.market)`;
  const [copiado, setCopiado]       = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const inputRef = useRef(null);

  /* Seleccionar texto al abrir */
  useEffect(() => {
    inputRef.current?.select();
  }, []);

  /* Auto-cierre a los 10 minutos */
  useEffect(() => {
    const t = setTimeout(onClose, 10 * 60 * 1000);
    return () => clearTimeout(t);
  }, [onClose]);

  /* Cerrar con Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mensaje);
    } catch {
      inputRef.current?.select();
      document.execCommand('copy');
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleConfirm = async () => {
    try {
      await fetch('/api/historial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario:      userId,
          item_nombre:     parte,
          item_url_nombre: slug,
          vendedor,
          precio_platinum: precio,
          estado_vendedor: estado,
        }),
      });
    } catch { /* silencioso */ }
    setConfirmado(true);
    setTimeout(onClose, 1800);
  };

  return createPortal(
    <div
      className="wf-comprar__overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="wf-comprar__popup">

        {/* Cerrar */}
        <button className="wf-comprar__close" onClick={onClose} aria-label="Cerrar">✕</button>

        {/* Título */}
        <div className="wf-comprar__title">
          <i className="fa-solid fa-cart-shopping"></i> Comprar en Warframe
        </div>
        <div className="wf-comprar__subtitle">
          Enviá este mensaje en el chat del juego para contactar al vendedor:
        </div>

        {/* Mensaje de trade */}
        <div className="wf-comprar__msg-row">
          <input
            ref={inputRef}
            className="wf-comprar__msg-input"
            readOnly
            value={mensaje}
            onFocus={e => e.target.select()}
          />
          <button
            className={`wf-comprar__copy-btn${copiado ? ' wf-comprar__copy-btn--ok' : ''}`}
            onClick={handleCopy}
          >
            {copiado ? '✓ Copiado' : '📋 Copiar'}
          </button>
        </div>

        {/* Divisor */}
        <div className="wf-comprar__divider"></div>

        {/* Confirmación */}
        <div className="wf-comprar__confirm-label">
          ¿Completaste la compra en el juego?
        </div>

        {confirmado ? (
          <div className="wf-comprar__success">
            <i className="fa-solid fa-check"></i> ¡Compra registrada en tu historial!
          </div>
        ) : (
          <div className="wf-comprar__confirm-btns">
            <button className="wf-comprar__btn--yes" onClick={handleConfirm}>
              <i className="fa-solid fa-check"></i> Sí, compré
            </button>
            <button className="wf-comprar__btn--no" onClick={onClose}>
              <i className="fa-solid fa-xmark"></i> No, cancelar
            </button>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}

/* ── Tarjeta de reliquia ── */
function RelicCard({ relic }) {
  return (
    <div className={`wf-acq__relic--card ${relic.vaulted ? 'wf-acq__relic--vaulted' : ''}`}>
      <div className="wf-acq__relic--img-wrap">
        <img src={relic.imagen} alt={relic.nombre} />
      </div>
      <a className="wf-acq__relic--name" href="#">{relic.nombre}</a>
      {relic.vaulted && <span className="wf-acq__relic--vault-tag">Vaulted</span>}
      <div className="wf-acq__relic--rarity">{relic.rareza}</div>
      <div className="wf-acq__relic--chances">
        <span>Intact: <b>{relic.chances.intact}</b></span>
        <span>Exceptional: <b>{relic.chances.exceptional}</b></span>
      </div>
      <div className="wf-acq__relic--chances">
        <span>Flawless: <b>{relic.chances.flawless}</b></span>
        <span>Radiant: <b>{relic.chances.radiant}</b></span>
      </div>
    </div>
  );
}

/* ── Fila de parte prime ── */
function PrimeRow({ parte, precioData, slug, nombreWarframe, userId }) {
  const [open, setOpen]                     = useState(false);
  const [showComprar, setShowComprar]       = useState(false);
  const [showLoginReq, setShowLoginReq]     = useState(false);

  const tienePrecios = precioData?.precio != null;

  return (
    <>
      <tr className="wf-acq__prime--row">
        {/* Objeto */}
        <td>
          <img src={parte.imagen} alt={parte.nombre} />
          {parte.nombre}
        </td>

        {/* Precio */}
        <td>
          <span className="wf-acq__prime--price">
            <span className="wf-acq__plat--icon-sm"></span>
            {tienePrecios ? `${precioData.precio} pl` : '— pl'}
          </span>
        </td>

        {/* Vendedor */}
        <td>
          <span className="wf-acq__prime--seller">
            {tienePrecios ? precioData.vendedor : '—'}
          </span>
        </td>

        {/* Mercado — botón Comprar */}
        <td>
          {tienePrecios && (
            <button
              className="wf-acq__comprar--btn"
              onClick={() => userId ? setShowComprar(true) : setShowLoginReq(true)}
            >
              <i className="fa-solid fa-bag-shopping"></i> Comprar
            </button>
          )}

          {showLoginReq && (
            <LoginRequeridoPopup onClose={() => setShowLoginReq(false)} />
          )}

          {showComprar && (
            <ComprarPopup
              parte={parte.nombre}
              slug={slug}
              precio={precioData.precio}
              vendedor={precioData.vendedor}
              estado={precioData.estado}
              warframe={nombreWarframe}
              userId={userId}
              onClose={() => setShowComprar(false)}
            />
          )}
        </td>

        {/* Ver reliquias */}
        <td>
          <button
            className={`wf-acq__relic--btn ${open ? 'active' : ''}`}
            onClick={() => setOpen(!open)}
          >
            Ver
          </button>
        </td>
      </tr>

      {/* Panel de reliquias expandido */}
      {open && (
        <tr className="wf-acq__relic--expand">
          <td colSpan={5}>
            <div className="wf-acq__relic--panel">
              <div className="wf-acq__relic--panel-label">
                Reliquias que contienen {parte.nombre}
              </div>
              <div className="wf-acq__relic--cards">
                {parte.reliquias.map((r, i) => (
                  <RelicCard key={i} relic={r} />
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Sección principal ── */
function WarframeAcquisition({ data, preciosWFM }) {
  const { adquisicion, prime, tienePrime, nombre } = data;
  const { user } = useAuth();

  return (
    <section className="wf-sec--root" id="acquisition">
      <div className="wf-sec__header--wrap">
        <span className="wf-sec__num--label">04</span>
        <h2 className="wf-sec__title--text">Adquisición</h2>
        <div className="wf-sec__title--line"></div>
      </div>
      <div className="wf-sec__body--wrap">

        {/* Non-Prime */}
        <div className="wf-cft__variant--title wf-cft__variant--std">
          {nombre} — Partes estándares <span className="wf-cft__vtag wf-cft__vtag--std">Non-Prime</span>
        </div>
        <div className="wf-acq__part--card">
          <table className="wf-cft__part--table">
            <thead>
              <tr>
                <th>Objeto</th>
                <th>Fuente</th>
                <th>Prob %</th>
                <th>Esperado</th>
              </tr>
            </thead>
            <tbody>
              {adquisicion.nonPrime.map((item, i) => (
                <tr key={i}>
                  <td><img src={item.imagen} alt={item.nombre} /> {item.nombre}</td>
                  <td className="wf-acq__qty--std">{item.fuente}</td>
                  <td>{item.probabilidad}</td>
                  <td>{item.esperado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Prime */}
        {tienePrime && (
          <>
            <div className="wf-cft__variant--title wf-cft__variant--prm">
              {nombre} Prime — Partes Prime <span className="wf-cft__vtag wf-cft__vtag--prm">Prime</span>
            </div>

            {prime.exclusivo ? (
              <div className="wf-acq__exclusivo">
                <i className="fa-solid fa-lock wf-acq__exclusivo--icon"></i>
                <p className="wf-acq__exclusivo--texto">{prime.exclusivoTexto}</p>
              </div>
            ) : (
              <div className="wf-acq__part--card">
                <table className="wf-cft__part--table wf-acq__prime--table">
                  <thead>
                    <tr>
                      <th>Objeto</th>
                      <th>Precio</th>
                      <th>Vendedor</th>
                      <th>Mercado</th>
                      <th>Fuente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prime.crafting.adquisicion.map((parte, i) => (
                      <PrimeRow
                        key={i}
                        parte={parte}
                        precioData={preciosWFM ? preciosWFM[i] : null}
                        slug={prime.wfmSlugs?.[i] ?? ''}
                        nombreWarframe={nombre}
                        userId={user?.id_usuario}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}

export default WarframeAcquisition;
