// Opciones de ejemplo para revisar el flujo. El catálogo definitivo se cargará desde Supabase.
export const preguntasProyecto = [
  {
    id: 'servicio', etiqueta: '¿Qué servicio te interesa?', opciones: [
      { valor: 'climatizacion', texto: 'Climatización' },
      { valor: 'calefaccion', texto: 'Calefaccion' },
      { valor: 'ventilacion', texto: 'Ventilación' },
      { valor: 'orientacion', texto: 'Necesito asesoramiento' },
    ],
  },
  {
    id: 'proyecto', etiqueta: '¿Para qué tipo de proyecto?', opciones: [
      { valor: 'vivienda', texto: 'Vivienda' },
      { valor: 'oficinas', texto: 'Comercio' },
      { valor: 'edificio', texto: 'Industria' },
      { valor: 'industria', texto: 'Hospitalaria/Laboratorio' },

    ],
  },
  {
    id: 'etapa', etiqueta: '¿En qué etapa estás?', opciones: [
      { valor: 'planificando', texto: 'Proyecto' },
      { valor: 'disenando', texto: 'Primera etapa de construccion' },
      { valor: 'presupuestando', texto: 'Finalizacion de obra' },

    ],
  },
] as const
