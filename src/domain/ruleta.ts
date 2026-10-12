import { disenoRuleta } from '../data/ruletaDiseno'

export function sortearPremio() {
  const muestra = new Uint32Array(1)
  const limite = Math.floor(4294967296 / disenoRuleta.premios.length) * disenoRuleta.premios.length
  do { crypto.getRandomValues(muestra) } while (muestra[0]! >= limite)
  return muestra[0]! % disenoRuleta.premios.length
}
