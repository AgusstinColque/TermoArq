// Opciones de ejemplo para revisar el flujo. El catálogo definitivo se cargará desde Supabase.
export const preguntasProyecto = [
  {
    id: 'servicio', etiqueta: '¿Qué servicio te interesa?', opciones: [
      { valor: 'climatizacion', texto: 'Climatización' },
      { valor: 'ventilacion', texto: 'Ventilación mecánica' },
      { valor: 'aislaciones', texto: 'Aislaciones térmicas' },
      { valor: 'arquitectura', texto: 'Obras de arquitectura' },
      { valor: 'piping', texto: 'Piping y servicios industriales' },
      { valor: 'laboratorios', texto: 'Construcción de laboratorios' },
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
      { valor: 'mineria', texto: 'Proyecto minero' },
      { valor: 'laboratorio', texto: 'Laboratorio' },
      { valor: 'institucional', texto: 'Obra institucional' },
      { valor: 'otro', texto: 'Otro proyecto' },
    ],
  },
  {
    id: 'etapa', etiqueta: '¿En qué etapa estás?', opciones: [
      { valor: 'planificando', texto: 'Estoy planificando' },
      { valor: 'disenando', texto: 'Estoy desarrollando el proyecto' },
      { valor: 'presupuestando', texto: 'Estoy buscando presupuestos' },
      { valor: 'ejecutando', texto: 'La obra está en ejecución' },
      { valor: 'existente', texto: 'Quiero mejorar una instalación' },
      { valor: 'explorando', texto: 'Estoy explorando posibilidades' },
    ],
  },
] as const
