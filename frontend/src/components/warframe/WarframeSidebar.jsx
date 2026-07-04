function WarframeSidebar({ data }) {
  const { stats, info, danio, tienePrime } = data;
  const statKeys = ['vida', 'escudo', 'armadura', 'energia'];
  const delays = [0.3, 0.4, 0.5, 0.6];

  return (
    <aside className="wf-sb--root">
      <div className="wf-sb__card--wrap">
        <div className="wf-sb__card--header">
          <div className="wf-sb__text--name">{data.nombre}</div>
          <div className="wf-sb__text--epiteto">{data.epiteto}</div>
        </div>
        <div className="wf-sb__img--wrapper">
          <div className="wf-sb__img--ring"></div>
          <img src={data.imagenes.perfil} alt={data.nombre} className="wf-sb__img--frame" />
        </div>
        <table className="wf-sb__table--info">
          <tbody>
            <tr><th>Sexo</th><td className="wf-sb__td--accent">{info.sexo}</td></tr>
            <tr><th>Maestría</th><td>MR {info.maestria}</td></tr>
            <tr><th>Fecha de lanzamiento</th><td>{info.lanzamiento}</td></tr>
            <tr><th>Actualización</th><td>{info.actualizacion}</td></tr>
            <tr><th>Polaridades</th><td className="wf-sb__td--blue">{Array.isArray(info.polaridades) ? info.polaridades.join(' · ') : info.polaridades}</td></tr>
            <tr><th>Polaridad del Exilus</th><td className="wf-sb__td--blue">{info.polaridadExilus ?? '—'}</td></tr>
            <tr><th>Polaridad Aura</th><td className="wf-sb__td--blue">{info.polaridadAura}</td></tr>
            <tr><th>Velocidad</th><td>{info.velocidad !== '' && info.velocidad != null ? Number(info.velocidad).toFixed(2) : '—'}</td></tr>
            <tr><th>Playstyle</th><td>{info.playstyle}</td></tr>
            <tr><th>Hab. del Helminto</th><td>{info.helminto}</td></tr>
            <tr><th>Elem. Progenitor</th><td>{info.progenitorEmoji} {info.progenitor}</td></tr>
          </tbody>
        </table>
        <div className="wf-sb__dmg--tags">
          <div className="wf-sb__dmg--label">Tipos de daño</div>
          {danio.map(d => (
            <span key={d.tipo} className={`wf-sb__dmg--tag ${d.clase}`}>
              {d.emoji} {d.tipo}
            </span>
          ))}
        </div>
        <div className="wf-sb__stats--bars">
          <div className="wf-sb__stats--header">
            <span></span>
            <span className="wf-sb__stats--legend">
              <span className="wf-sb__dot--base"></span>Base
            </span>
            {tienePrime && (
              <span className="wf-sb__stats--legend wf-sb__stats--prime-leg">
                <span className="wf-sb__dot--prime"></span>Prime
              </span>
            )}
          </div>
          {statKeys.map((key, i) => {
            const s = stats[key];
            const diff = s.prime - s.base;
            return (
              <div key={key} className="wf-sb__stat--group">
                <div className="wf-sb__stat--group-label">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
                <div className="wf-sb__stat--row">
                  <span className="wf-sb__tag--base">Base</span>
                  <div className="wf-sb__bar--bg">
                    <div className="wf-sb__bar--fill wf-sb__bar--fill-base"
                      style={{ width: `${s.barBase}%`, '--delay': `${delays[i]}s` }}></div>
                  </div>
                  <span className="wf-sb__stat--val">{s.base}</span>
                  <span className="wf-sb__diff--badge wf-sb__diff--none">—</span>
                </div>
                {tienePrime && (
                  <div className="wf-sb__stat--row">
                    <span className="wf-sb__tag--prime">Prime</span>
                    <div className="wf-sb__bar--bg">
                      <div className="wf-sb__bar--fill wf-sb__bar--fill-prime"
                        style={{ width: `${s.barPrime}%`, '--delay': `${delays[i] + 0.1}s` }}></div>
                    </div>
                    <span className="wf-sb__stat--val">{s.prime}</span>
                    <span className={`wf-sb__diff--badge ${diff === 0 ? 'wf-sb__diff--none' : ''}`}>
                      {diff === 0 ? '—' : `+${diff}`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default WarframeSidebar;