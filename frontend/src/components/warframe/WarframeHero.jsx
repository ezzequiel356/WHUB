function WarframeHero({ data }) {
  const filled  = data.complejidad;
  const empty   = data.complejidadMax - data.complejidad;

  return (
    <div className="wf-hero__card--root">
<div className="wf-hero__corner--top-left"></div>
      <div className="wf-hero__corner--bottom-right"></div>
      <div className="wf-hero__img--placeholder">
        <img src={data.imagenes.hero} alt={data.nombre} />
      </div>
      <div className="wf-hero__hud--overlay">
        <div className="wf-hero__hud--panel">
          <div className="wf-hero__hud--label">Rol</div>
          <div className="wf-hero__hud--value">
            {Array.isArray(data.rol) ? data.rol.join(' · ') : data.rol}
          </div>
        </div>
        <div className="wf-hero__hud--panel">
          <div className="wf-hero__hud--label">Complejidad</div>
          <div className="wf-hero__hud--dots">
            {Array.from({ length: filled }).map((_, i) => (
              <div key={`f-${i}`} className="wf-hero__dot--filled"></div>
            ))}
            {Array.from({ length: empty }).map((_, i) => (
              <div key={`e-${i}`} className="wf-hero__dot--empty"></div>
            ))}
            <span className="wf-hero__hud--ratio">
              {data.complejidad} / {data.complejidadMax}
            </span>
          </div>
        </div>
        <div className="wf-hero__hud--panel">
          <div className="wf-hero__hud--label">Tip</div>
          <div className="wf-hero__hud--tip">
            {data.tip}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WarframeHero;