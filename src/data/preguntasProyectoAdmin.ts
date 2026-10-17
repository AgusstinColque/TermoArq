import { preguntasProyecto } from './preguntasProyecto.ts'
// Códigos y textos del catálogo habilitado por la migración de registro público.
const preguntasAnteriores = [
  {
    id: 'servicio', etiqueta: '¿Qué servicio te interesa?', opciones: [
      { valor: 'climatizacion', texto: 'Climatización (frío y calefacción)' },
      { valor: 'ventilacion', texto: 'Ventilación mecánica' },
      { valor: 'consultoria', texto: 'Consultoría técnica' },
      { valor: 'orientacion', texto: 'Necesito asesoramiento' },
    ],
  },
  {
    id: 'proyecto', etiqueta: '¿Para qué tipo de proyecto?', opciones: [
      { valor: 'vivienda', texto: 'Vivienda' },
      { valor: 'oficinas', texto: 'Oficinas o local comercial' },
      { valor: 'edificio', texto: 'Edificio o desarrollo inmobiliario' },
      { valor: 'industria', texto: 'Planta industrial' },
      { valor: 'laboratorio', texto: 'Laboratorio' },
    ],
  },
  {
    id: 'etapa', etiqueta: '¿En qué etapa estás?', opciones: [
      { valor: 'planificando', texto: 'Estoy planificando' },
      { valor: 'disenando', texto: 'Estoy desarrollando el proyecto' },
      { valor: 'presupuestando', texto: 'Estoy buscando presupuestos' },
      { valor: 'ejecutando', texto: 'La obra está en ejecución' },
    ],
  },
] as const

export const preguntasProyectoAdmin = preguntasProyecto.map(pregunta => ({ ...pregunta, opciones: [...pregunta.opciones, ...(preguntasAnteriores.find(anterior => anterior.id === pregunta.id)?.opciones ?? []).filter(anterior => !pregunta.opciones.some(actual => actual.valor === (anterior.valor as string)))] }))
