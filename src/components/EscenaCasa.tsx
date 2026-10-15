import { useId, useState } from 'react'
import { type AmbienteCasa } from '../data/misionCasa'
import '../styles/escenaCasa.css'

const ambientes = ['living', 'dormitorio'] as const
// Coordenadas del render 1536 × 1024: origen en las rejillas de los equipos.
const geometria = {
  living: {
    calor: ['M440 570C414 548 464 532 440 508S426 478 440 465', 'M493 593C467 571 517 555 493 531S479 501 493 488', 'M546 616C520 594 570 578 546 554S532 524 546 511'],
    frio: ['M627 365C625 410 534 462 397 492', 'M647 376C650 436 568 505 438 537', 'M667 387C674 468 602 548 486 579'],
    origen: [647, 376], destino: [438, 537],
    cajaCalor: [400, 432, 170, 160], cajaAire: [398, 353, 280, 220],
  },
  dormitorio: {
    calor: ['M758 312C732 290 782 274 758 250S744 220 758 207', 'M811 337C785 315 835 299 811 275S797 245 811 232', 'M864 362C838 340 888 324 864 300S850 270 864 257'],
    frio: ['M905 140C904 178 847 213 755 230', 'M925 152C926 202 876 248 788 274', 'M945 164C949 225 906 284 831 310'],
    origen: [925, 152], destino: [788, 274],
    cajaCalor: [710, 190, 170, 160], cajaAire: [690, 125, 260, 200],
  },
}
export function EscenaCasa({ activos, calientes, onError, destacarDormitorio = false }: {
  destacarDormitorio?: boolean; activos: readonly AmbienteCasa[]; calientes: readonly AmbienteCasa[]; onError: () => void
}) {
  const geometriaEscena = destacarDormitorio ? { ...geometria, dormitorio: {
    calor: ['M678 599C658 577 698 559 678 535S662 490 678 463', 'M746 620C726 598 766 580 746 556S730 511 746 484', 'M813 640C793 618 833 600 813 576S797 531 813 504'],
    frio: ['M974 240Q966 376 686 410', 'M1010 260Q1002 423 718 475', 'M1042 288Q1026 471 746 536'],
    origen: [1010, 260], destino: [718, 475],
    cajaCalor: [600, 420, 280, 210], cajaAire: [646, 223, 400, 340],
  }} : geometria
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [fallo, setFallo] = useState(false)
  return <div className={'casa-clima ' + (destacarDormitorio ? 'casa-clima--dormitorio ' : '') + 'casa-clima--animada'}>
    <div className="casa-clima__camara">
    <img src={destacarDormitorio ? "/media/mision-dormitorio-detalle.webp" : "/media/mision-casa-equipos.webp"} width="1536" height="1024"
      alt={(destacarDormitorio ? 'Vista completa del dormitorio con cama, ventana y aire acondicionado. ' : 'Casa con aire acondicionado en living-comedor y dormitorio. ') + (activos.length ? 'Climatización activa en: ' + activos.map(a => a === 'living' ? 'living-comedor' : a).join(' y ') + '.' : 'Equipos apagados.')}
      draggable={false} onError={() => { setFallo(true); onError() }}/>
    {!fallo && <svg className="casa-clima__efectos" viewBox="0 0 1536 1024" aria-hidden="true">
      <defs><linearGradient id={id + 'calor'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe5a3"/><stop offset="1" stopColor="#ffb044" stopOpacity=".9"/></linearGradient>{ambientes.map(ambiente => {
        const g = geometriaEscena[ambiente]
        return <linearGradient key={ambiente} id={id + ambiente} gradientUnits="userSpaceOnUse" x1={g.origen[0]} y1={g.origen[1]} x2={g.destino[0]} y2={g.destino[1]}>
          <stop offset="0" stopColor="#d8f8ff"/><stop offset=".6" stopColor="#8de4ff" stopOpacity=".95"/><stop offset="1" stopColor="#80ddff" stopOpacity="0"/>
        </linearGradient>
      })}</defs>
      {ambientes.filter(ambiente => !destacarDormitorio || ambiente === 'dormitorio').map(ambiente => <g key={ambiente} data-ambiente={ambiente} className={'casa-clima__ambiente' + (activos.includes(ambiente) ? ' casa-clima__ambiente--activo' : '')}>
        <g className={'casa-clima__calor' + (calientes.includes(ambiente) && !activos.includes(ambiente) ? ' casa-clima__calor--visible' : '')}>
          <g className="casa-clima__calor-fijo" stroke={'url(#' + id + 'calor)'}>
            {geometriaEscena[ambiente].calor.map((d, i) => <path key={i} d={d}/>)}
          </g>
          <svg className="casa-clima__calor-movil" x={geometriaEscena[ambiente].cajaCalor[0]} y={geometriaEscena[ambiente].cajaCalor[1]} width={geometriaEscena[ambiente].cajaCalor[2]} height={geometriaEscena[ambiente].cajaCalor[3]} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M28 85C8 65 44 53 28 30S19 12 27 5"/>
            <path d="M52 85C32 65 68 53 52 30S43 12 51 5"/>
            <path d="M76 85C56 65 92 53 76 30S67 12 75 5"/>
          </svg>
        </g>
        <g className="casa-clima__frio">
          <g className="casa-clima__aire-fijo" stroke={'url(#' + id + ambiente + ')'}>
            {geometriaEscena[ambiente].frio.map((d, i) => {
              const [x, y] = d.slice(1).split(/[A-Z ]/).map(Number)
              return <path key={i} d={d} transform={`translate(${x} ${y}) scale(.8) translate(${-x!} ${-y!})`}/>
            })}
          </g>
          <svg className="casa-clima__aire-movil" x={geometriaEscena[ambiente].cajaAire[0]} y={geometriaEscena[ambiente].cajaAire[1]} width={geometriaEscena[ambiente].cajaAire[2]} height={geometriaEscena[ambiente].cajaAire[3]} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path className="casa-clima__corriente" transform="translate(82 5) scale(.8) translate(-82 -5)" d="M82 5Q80 45 10 55"/>
            <path className="casa-clima__corriente" transform="translate(91 11) scale(.8) translate(-91 -11)" d="M91 11Q89 59 18 74"/>
            <path className="casa-clima__corriente" transform="translate(99 19) scale(.8) translate(-99 -19)" d="M99 19Q95 73 25 92"/>
          </svg>
        </g>
      </g>)}
    </svg>}
    {!fallo && destacarDormitorio && activos.includes('dormitorio') && <svg className="mision__display" viewBox="0 0 1536 1024" role="img" aria-label="Aire acondicionado a 24 grados Celsius"><text transform="translate(1022 241) rotate(31)" textAnchor="middle" fontSize="22">24 °C</text></svg>}
    </div>
  </div>
}


