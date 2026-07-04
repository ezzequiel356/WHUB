function DualWarframeToggle({ active, onChange }) {
  const isSirius = active === 'sirius';

  return (
    <div className="dwt__root" data-active={active}>
      <span className={`dwt__label dwt__label--sirius ${isSirius ? 'dwt__label--active' : ''}`}>
        SIRIUS
      </span>
      <button
        className={`dwt__switch ${isSirius ? 'dwt__switch--sirius' : 'dwt__switch--orion'}`}
        onClick={() => onChange(isSirius ? 'orion' : 'sirius')}
        aria-label="Cambiar entre Sirius y Orion"
      >
        <span className="dwt__knob" />
      </button>
      <span className={`dwt__label dwt__label--orion ${!isSirius ? 'dwt__label--active' : ''}`}>
        ORION
      </span>
    </div>
  );
}

export default DualWarframeToggle;
