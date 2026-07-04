import { useRef } from 'react';

function ModCard({ mod }) {
  const tooltipRef = useRef(null);

  const showTooltip = (e) => {
    if (!tooltipRef.current) return;
    tooltipRef.current.style.display = 'block';
  };
  const hideTooltip = () => {
    if (!tooltipRef.current) return;
    tooltipRef.current.style.display = 'none';
  };
  const handleTouch = (e) => {
    if (!tooltipRef.current) return;
    const isVisible = tooltipRef.current.style.display === 'block';
    tooltipRef.current.style.display = isVisible ? 'none' : 'block';
  };

  return (
    <div className="wf-bld__mod--slot">
      {mod.tipo === 'aura' && <span className="wf-bld__mod--type-label">Aura</span>}
      {mod.tipo === 'exilus' && <span className="wf-bld__mod--type-label">Exilus</span>}
      <div
        className="wf-bld__mod--card"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onTouchStart={handleTouch}
      >
        <img src={mod.imagen} alt={mod.nombre} />
        <div ref={tooltipRef} className="wf-bld__mod--tooltip" style={{ display: 'none' }}>
          <img src={mod.tooltip} alt={`${mod.nombre} full`} />
        </div>
      </div>
      <div className="wf-bld__mod--meta">
        <img className="wf-bld__mod--polarity" src={mod.polaridadImg} alt={mod.polaridad} />
        {mod.forma && <span className="wf-bld__mod--forma">forma</span>}
      </div>
    </div>
  );
}

function WarframeBuilds({ data }) {
  const { build } = data;
  const auras  = data.build.dobleAura
    ? build.mods.filter(m => m.tipo === 'aura')
    : [build.mods.find(m => m.tipo === 'aura')].filter(Boolean);
  const exilus = build.mods.find(m => m.tipo === 'exilus');
  const mods   = build.mods.filter(m => m.tipo === 'mod');
  const fila2  = mods.slice(0, 4);
  const fila3  = mods.slice(4, 8);
  const barPct = (build.itemRankActual / build.itemRankMax) * 100;

  return (
    <section className="wf-sec--root" id="builds">
      <div className="wf-sec__header--wrap">
        <span className="wf-sec__num--label">06</span>
        <h2 className="wf-sec__title--text">Builds</h2>
        <div className="wf-sec__title--line"></div>
      </div>
      <div className="wf-sec__body--wrap">
        <p>
          En esta sección solamente se mostrará la build con mayor cantidad de votos en{' '}
          <a href="https://overframe.gg" target="_blank">overframe.gg</a>
        </p>

        <div className="wf-bld__stats--panel">
          <div className="wf-bld__stats--row">
            <span className="wf-bld__stats--label">ITEM RANK</span>
            <span className="wf-bld__stats--val wf-bld__stats--rank">{build.itemRank}</span>
          </div>
          <div className="wf-bld__bar--wrap">
            <div className="wf-bld__bar--fill" style={{ width: `${barPct}%` }}></div>
          </div>
          <span className="wf-bld__bar--label">
            {build.itemRankActual} / {build.itemRankMax}
          </span>
          <div className="wf-bld__stats--row">
            <span className="wf-bld__stats--label">OROKIN REACTOR</span>
            <span className={`wf-bld__toggle ${build.orokinReactor ? 'wf-bld__toggle--active' : ''}`}></span>
          </div>
          <div className="wf-bld__stats--divider"></div>
          {Object.entries(build.stats).map(([key, val]) => (
            <div key={key} className="wf-bld__stats--row">
              <span className="wf-bld__stats--label">{key.toUpperCase()}</span>
              <span className={`wf-bld__stats--val ${val.positivo ? 'wf-bld__stats--positive' : 'wf-bld__stats--negative'}`}>
                {val.valor}
              </span>
            </div>
          ))}
        </div>

        <div className="wf-bld__header--wrap">
          <span className="wf-bld__votes--arrow">▲</span>
          <span className="wf-bld__votes--num">{build.votos} votos</span>
          <span className="wf-bld__votes--label">{build.label}</span>
          <span className="wf-bld__formas--info">{build.formas}×</span>
          <img src="/warframes-assets/shared/polarities/Forma.webp" alt="Forma" />
        </div>

        <div className="wf-bld__grid--wrap">
          <div className="wf-bld__grid--row">
            {auras.map((mod, i) => <ModCard key={i} mod={mod} />)}
            {exilus && <ModCard mod={exilus} />}
          </div>
          <div className="wf-bld__grid--row">
            {fila2.map((mod, i) => <ModCard key={i} mod={mod} />)}
          </div>
          <div className="wf-bld__grid--row">
            {fila3.map((mod, i) => <ModCard key={i} mod={mod} />)}
          </div>
          <div className="wf-bld__arcanes--row">
            {build.arcanos.map((arc, i) => (
              <div key={i} className="wf-bld__mod--slot">
                <div className="wf-bld__arcane--card">
                  <img src={arc.imagen} alt={arc.nombre} />
                  <div className="wf-bld__arcane--tooltip">
                    <strong>{arc.nombre}</strong>
                    {arc.descripcion}
                  </div>
                </div>
                <span className="wf-bld__arcane--name">{arc.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WarframeBuilds;