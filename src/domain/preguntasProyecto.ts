import { preguntasProyecto } from '../data/preguntasProyecto'

export type CampoProyecto = (typeof preguntasProyecto)[number]['id']
export type RespuestasProyecto = Record<CampoProyecto, string>
export type ErroresProyecto = Partial<Record<CampoProyecto, string>>

export function validarProyecto(respuestas: RespuestasProyecto): ErroresProyecto {
  const errores: ErroresProyecto = {}
  for (const pregunta of preguntasProyecto) {
    if (!pregunta.opciones.some(opcion => opcion.valor === respuestas[pregunta.id])) {
      errores[pregunta.id] = 'Elegí una opción para esta pregunta.'
    }
  }
  return errores
}
