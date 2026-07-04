function WarframeDescription({ data }) {
  return (
    <section className="wf-sec--root" id="description">
      <div className="wf-sec__header--wrap">
        <span className="wf-sec__num--label">01</span>
        <h2 className="wf-sec__title--text">Descripción</h2>
        <div className="wf-sec__title--line"></div>
      </div>
      <div className="wf-sec__body--wrap">
        <div className="wf-sec__lore--quote">
          <p>"{data.lore}"</p>
          <cite>— Codex · Tenno Lore Archive</cite>
        </div>
        {data.descripcion.map((parrafo, i) => (
          <p key={i}>{parrafo}</p>
        ))}
      </div>
    </section>
  );
}

export default WarframeDescription;