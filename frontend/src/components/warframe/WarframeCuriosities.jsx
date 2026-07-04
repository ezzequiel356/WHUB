function WarframeCuriosities({ data }) {
  return (
    <section className="wf-sec--root" id="curiosities">
      <div className="wf-sec__header--wrap">
        <span className="wf-sec__num--label">05</span>
        <h2 className="wf-sec__title--text">Curiosidades</h2>
        <div className="wf-sec__title--line"></div>
      </div>
      <div className="wf-sec__body--wrap">
        <ul className="wf-cur__list--wrap">
          {data.curiosidades.map((texto, i) => (
            <li key={i} className="wf-cur__item--wrap">
              <div className="wf-cur__item--bullet"></div>
              <div className="wf-cur__item--text">{texto}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default WarframeCuriosities;