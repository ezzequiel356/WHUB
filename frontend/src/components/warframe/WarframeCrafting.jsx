function WarframeCrafting({ data }) {
  const { crafting, prime, tienePrime } = data;

  return (
    <section className="wf-sec--root" id="crafting">
      <div className="wf-sec__header--wrap">
        <span className="wf-sec__num--label">03</span>
        <h2 className="wf-sec__title--text">Crafting</h2>
        <div className="wf-sec__title--line"></div>
      </div>
      <div className="wf-sec__body--wrap">
        <p>
          {data.nombre} puede ser obtenido al derrotar un <strong>jefe</strong> (Ver adquisición),
          o puede ser obtenido comprándolo desde el mercado.
          {tienePrime && ' Además, tiene una variante Prime que puede ser adquirida mediante las Reliquias del Vacío.'}
        </p>
        <div className="wf-cft__foundry--grid">
          <div className="wf-cft__foundry--item">
            <div className="wf-cft__foundry--icon">⏱</div>
            <div>
              <div className="wf-cft__foundry--name">Tiempo de Construcción</div>
              <div className="wf-cft__foundry--val">{crafting.tiempoTotal}</div>
              <div className="wf-cft__foundry--note">{crafting.tiempoPorParte} por componente</div>
            </div>
          </div>
          <div className="wf-cft__foundry--item">
            <div className="wf-cft__foundry--icon">💰</div>
            <div>
              <div className="wf-cft__foundry--name">Créditos Totales</div>
              <div className="wf-cft__foundry--val">{crafting.creditosTotal !== '' ? Number(crafting.creditosTotal).toLocaleString() : '—'} Credits</div>
              <div className="wf-cft__foundry--note">15k × 3 partes + 25k principal</div>
            </div>
          </div>
          <div className="wf-cft__foundry--item">
            <div className="wf-cft__foundry--icon">🔧</div>
            <div>
              <div className="wf-cft__foundry--name">Componentes</div>
              <div className="wf-cft__foundry--val">
                {crafting.partes.map(p => p.nombre.replace('Plano de ', '').replace('Plano del ', '')).join(' · ')}
              </div>
              <div className="wf-cft__foundry--note">Los tres requeridos</div>
            </div>
          </div>
          <div className="wf-cft__foundry--item">
            <div className="wf-cft__foundry--icon">⚡</div>
            <div>
              <div className="wf-cft__foundry--name">Coste de Rush</div>
              <div className="wf-cft__foundry--val">{crafting.costoRush} Platinos</div>
              <div className="wf-cft__foundry--note">Saltea el tiempo de construcción</div>
            </div>
          </div>
        </div>

        <div className="wf-cft__variant--title wf-cft__variant--std">
          {data.nombre} — Partes estándares <span className="wf-cft__vtag wf-cft__vtag--std">Non-Prime</span>
        </div>
        {crafting.partes.map((parte, i) => (
          <PartCard key={i} parte={parte} isPrime={false} />
        ))}

        {tienePrime && (
          <>
            <div className="wf-cft__divider--prime"></div>
            <div className="wf-cft__variant--title wf-cft__variant--prm">
              {data.nombre} Prime — Partes Prime <span className="wf-cft__vtag wf-cft__vtag--prm">Prime</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', position: 'relative' }}>
              Las partes de {data.nombre} Prime son obtenidas exclusivamente de las{' '}
              <strong style={{ color: 'var(--accent-gold)' }}>Reliquias del Vacío</strong>.
              Todas las partes prime requieren{' '}
              <strong style={{ color: 'var(--accent-gold)' }}>Células Orokin</strong>{' '}
              además de los materiales listados.
            </p>
            {prime.crafting.partes.map((parte, i) => (
              <PartCard key={i} parte={parte} isPrime={true} />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

function PartCard({ parte, isPrime }) {
  return (
    <div className="wf-cft__part--card">
      <div className={`wf-cft__part--header ${isPrime ? 'wf-cft__part--header-prime' : ''}`}>
        <img
          src={parte.imagen}
          alt={parte.nombre}
          className={`wf-cft__part--img ${isPrime ? 'wf-cft__part--img-prime' : ''}`}
        />
        <div className="wf-cft__part--info">
          <div className={`wf-cft__part--name ${isPrime ? 'wf-cft__part--name-prime' : ''}`}>
            {parte.nombre}
          </div>
          <div className="wf-cft__part--time">⏱ Tiempo de construcción: 12 horas</div>
        </div>
      </div>
      <table className="wf-cft__part--table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Qty</th>
            <th>Fuente</th>
          </tr>
        </thead>
        <tbody>
          {parte.materiales.map((mat, i) => (
            <tr key={i}>
              <td>
                <img src={mat.imagen} alt={mat.nombre} />
                {mat.nombre}
              </td>
              <td className={isPrime ? 'wf-cft__qty--prime' : 'wf-cft__qty--std'}>
                {mat.cantidad.toLocaleString()}
              </td>
              <td>{mat.fuente}</td>
            </tr>
          ))}
          <tr>
            <td><img src="/warframes-assets/shared/materials/credits.webp" alt="Credits" /> Créditos</td>
            <td className="wf-cft__qty--credits">{parte.creditos.toLocaleString()}</td>
            <td>—</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default WarframeCrafting;