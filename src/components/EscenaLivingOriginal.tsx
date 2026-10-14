// Escena y trazados originales aportados por el usuario, sin recalcular coordenadas.
export function EscenaLivingOriginal({ fresco, onError }: { fresco: boolean; onError: () => void }) {
  return <div className={'escena-living-original' + (fresco ? ' mision--fresca' : '')} role="img" aria-label={fresco ? 'Living climatizado a 24 °C con aire fresco saliendo del equipo; los otros ambientes permanecen oscuros' : 'Living con ondas de calor ascendentes; los otros ambientes permanecen oscuros'}>
        <div className="mision__camara">
          <img className="mision__casa" src="/media/mision-escena-original.png" alt="" draggable={false} onError={onError} />

          <img className="mision__resuelta" src="/media/mision-escena-resuelta.png" alt="" onError={onError} />
          <svg className="mision__ondas-fijas mision__ondas-fijas--calor" viewBox="0 0 1049 1500" aria-hidden="true">
            <defs><linearGradient id="mision-calor-fijo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe5a3"/><stop offset="1" stopColor="#ffb044" stopOpacity=".9"/></linearGradient></defs>
            <path d="M510 620C535 588 487 567 515 530"/>
            <path d="M543 620C565 585 510 564 542 525"/>
            <path d="M568 620C588 594 548 577 576 549S606 533 614 524"/>
          </svg>
          <svg className="mision__ondas-fijas mision__ondas-fijas--aire" viewBox="0 0 1049 1500" aria-hidden="true">
            <defs><linearGradient id="mision-aire-fijo" gradientUnits="userSpaceOnUse" x1="627" y1="480" x2="504" y2="583"><stop offset="0" stopColor="#d8f8ff" stopOpacity="1"/><stop offset=".6" stopColor="#8de4ff" stopOpacity=".95"/><stop offset="1" stopColor="#80ddff" stopOpacity="0"/></linearGradient></defs>
            <path transform="translate(606 477) scale(.8) translate(-606 -477)" d="M606 477C605 512 561 541 486 551"/>
            <path transform="translate(619 484) scale(.8) translate(-619 -484)" d="M619 484C620 532 581 559 514 572"/>
            <path transform="translate(633 490) scale(.8) translate(-633 -490)" d="M633 490C634 547 600 580 551 594"/>
          </svg>
          {fresco && <svg className="mision__display" viewBox="0 0 1049 1500" aria-hidden="true"><text transform="translate(607 454) rotate(32)" textAnchor="middle" fontSize="12">24 °C</text></svg>}
          <svg className="mision__calor" viewBox="0 0 100 100" aria-hidden="true"><path d="M28 85C8 65 44 53 28 30S19 12 27 5"/><path d="M52 85C32 65 68 53 52 30S43 12 51 5"/><path d="M76 85C56 65 92 53 76 30S67 12 75 5"/></svg>
          <svg className="mision__aire" viewBox="0 0 100 100" aria-hidden="true"><path transform="translate(82 5) scale(.8) translate(-82 -5)" d="M82 5Q80 45 10 55"/><path transform="translate(91 11) scale(.8) translate(-91 -11)" d="M91 11Q89 59 18 74"/><path transform="translate(99 19) scale(.8) translate(-99 -19)" d="M99 19Q95 73 25 92"/></svg>
        </div>
  </div>
}
