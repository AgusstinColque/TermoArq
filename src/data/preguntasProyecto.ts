// Catálogo confirmado por el equipo de TermoArq.
export const preguntasProyecto = [
  {
    "id": "servicio",
    "etiqueta": "¿Qué servicio te interesa?",
    "opciones": [
      {
        "valor": "climatizacion",
        "texto": "Climatización"
      },
      {
        "valor": "calefaccion",
        "texto": "Calefacción"
      },
      {
        "valor": "ventilacion",
        "texto": "Ventilación"
      },
      {
        "valor": "presurizacion_escalera",
        "texto": "Presurización de escalera"
      },
      {
        "valor": "construccion",
        "texto": "Construcción"
      }
    ]
  },
  {
    "id": "proyecto",
    "etiqueta": "¿Para qué tipo de proyecto?",
    "opciones": [
      {
        "valor": "vivienda",
        "texto": "Vivienda"
      },
      {
        "valor": "comercio",
        "texto": "Comercio"
      },
      {
        "valor": "industria",
        "texto": "Industria"
      },
      {
        "valor": "hospitalaria_laboratorio",
        "texto": "Hospitalaria / Laboratorio"
      }
    ]
  },
  {
    "id": "etapa",
    "etiqueta": "¿En qué etapa estás?",
    "opciones": [
      {
        "valor": "proyecto",
        "texto": "Proyecto"
      },
      {
        "valor": "primera_etapa",
        "texto": "Primera etapa de construcción"
      },
      {
        "valor": "finalizacion_obra",
        "texto": "Finalización de obra"
      }
    ]
  }
] as const
