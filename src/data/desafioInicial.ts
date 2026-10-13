// Banco aprobado para la trivia de desbloqueo de Expo NOA 2026 (V3).
// Los identificadores 1–15 coinciden con el mazo repartido por Supabase.
export type OpcionDesbloqueo = 'a' | 'b' | 'c'

export interface PreguntaDesbloqueo {
  id: number
  categoria: string
  pregunta: string
  opciones: readonly { id: OpcionDesbloqueo; texto: string }[]
  correcta: OpcionDesbloqueo
  explicacion: string
}

export const preguntasDesbloqueo: readonly PreguntaDesbloqueo[] = [
  {
    "id": 1,
    "categoria": "Aire acondicionado",
    "pregunta": "¿Qué hay que tener en cuenta para elegir el aire acondicionado de un ambiente?",
    "opciones": [
      {
        "id": "a",
        "texto": "Solamente los metros cuadrados."
      },
      {
        "id": "b",
        "texto": "El tamaño, las ventanas, el sol y el uso del ambiente, realizando un balance térmico para determinar la potencia adecuada."
      },
      {
        "id": "c",
        "texto": "Únicamente la marca del equipo."
      }
    ],
    "correcta": "b",
    "explicacion": "En Termoarq realizamos balances térmicos para determinar la potencia necesaria y seleccionar el equipo adecuado para cada ambiente."
  },
  {
    "id": 2,
    "categoria": "Aire acondicionado",
    "pregunta": "¿Poner un aire acondicionado de mayor potencia garantiza enfriar mejor un ambiente?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sí, cuanto más grande, mejor."
      },
      {
        "id": "b",
        "texto": "No. Lo importante es seleccionar la potencia adecuada para lograr mayor eficiencia energética."
      },
      {
        "id": "c",
        "texto": "Sí, porque consume menos electricidad."
      }
    ],
    "correcta": "b",
    "explicacion": "Una capacidad superior a la necesaria no garantiza mayor confort. El correcto dimensionamiento ayuda a optimizar el funcionamiento y el consumo energético."
  },
  {
    "id": 3,
    "categoria": "Aire acondicionado",
    "pregunta": "¿Un aire acondicionado tipo split también renueva el aire del ambiente?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sí, siempre ingresa aire nuevo del exterior."
      },
      {
        "id": "b",
        "texto": "No necesariamente. La mayoría de los equipos split recirculan el aire interior."
      },
      {
        "id": "c",
        "texto": "Sí, pero solamente en verano."
      }
    ],
    "correcta": "b",
    "explicacion": "Un equipo split convencional recircula el aire interior. La renovación de aire requiere un sistema de ventilación o una solución específica."
  },
  {
    "id": 4,
    "categoria": "Aire acondicionado",
    "pregunta": "¿Qué ventaja ofrecen los sistemas de climatización VRV o VRF?",
    "opciones": [
      {
        "id": "a",
        "texto": "Permiten climatizar varios ambientes con una única unidad exterior y favorecer el ahorro energético."
      },
      {
        "id": "b",
        "texto": "Hacen que todos los ambientes tengan obligatoriamente la misma temperatura."
      },
      {
        "id": "c",
        "texto": "Funcionan únicamente en viviendas pequeñas."
      }
    ],
    "correcta": "a",
    "explicacion": "Los sistemas VRV/VRF permiten climatizar múltiples espacios con control por zonas y un funcionamiento eficiente según la demanda."
  },
  {
    "id": 5,
    "categoria": "Aire acondicionado",
    "pregunta": "¿Por qué es importante renovar el aire en oficinas, industrias y otros espacios cerrados?",
    "opciones": [
      {
        "id": "a",
        "texto": "Para mejorar la calidad del aire interior y reducir la acumulación de contaminantes."
      },
      {
        "id": "b",
        "texto": "Únicamente para hacer que el aire acondicionado enfríe más."
      },
      {
        "id": "c",
        "texto": "Porque así no se necesitan filtros ni mantenimiento."
      }
    ],
    "correcta": "a",
    "explicacion": "La ventilación adecuada contribuye a la calidad del aire interior. Termoarq diseña sistemas de ventilación y extracción adaptados a cada instalación."
  },
  {
    "id": 6,
    "categoria": "Calefacción",
    "pregunta": "¿Cómo funciona la calefacción por piso radiante?",
    "opciones": [
      {
        "id": "a",
        "texto": "Calienta únicamente el aire cerca del techo."
      },
      {
        "id": "b",
        "texto": "Distribuye calor desde el piso hacia el ambiente."
      },
      {
        "id": "c",
        "texto": "Funciona como un aire acondicionado convencional."
      }
    ],
    "correcta": "b",
    "explicacion": "El piso radiante por agua utiliza circuitos instalados bajo el piso para distribuir el calor de forma uniforme."
  },
  {
    "id": 7,
    "categoria": "Calefacción",
    "pregunta": "¿Qué tienen en común los radiadores y el piso radiante por agua?",
    "opciones": [
      {
        "id": "a",
        "texto": "Ambos pueden utilizar agua caliente para calefaccionar los ambientes."
      },
      {
        "id": "b",
        "texto": "Ambos necesitan aire acondicionado para funcionar."
      },
      {
        "id": "c",
        "texto": "Ambos solamente pueden instalarse en edificios industriales."
      }
    ],
    "correcta": "a",
    "explicacion": "Son sistemas de calefacción hidrónica que pueden utilizar calderas o bombas de calor adecuadas como fuente de energía térmica."
  },
  {
    "id": 8,
    "categoria": "Presurización de escaleras",
    "pregunta": "¿Qué debe contemplar el diseño de un sistema de presurización de escaleras?",
    "opciones": [
      {
        "id": "a",
        "texto": "Únicamente colocar un ventilador de gran potencia."
      },
      {
        "id": "b",
        "texto": "Realizar el cálculo según norma para una correcta selección del ventilador."
      },
      {
        "id": "c",
        "texto": "Mantener las escaleras a una temperatura más baja."
      }
    ],
    "correcta": "b",
    "explicacion": "El cálculo conforme a la normativa aplicable contempla caudales, presiones, fugas y condiciones de apertura de puertas, para seleccionar correctamente el ventilador y el sistema."
  },
  {
    "id": 9,
    "categoria": "Presurización de escaleras",
    "pregunta": "¿Cómo ayuda un sistema de presurización a proteger una escalera de emergencia?",
    "opciones": [
      {
        "id": "a",
        "texto": "Inyectando aire para generar presión positiva en la caja de escalera, evitando que el humo ingrese al medio de escape seguro."
      },
      {
        "id": "b",
        "texto": "Enfriando las paredes de la escalera."
      },
      {
        "id": "c",
        "texto": "Extrayendo todo el oxígeno de la escalera."
      }
    ],
    "correcta": "a",
    "explicacion": "La presión positiva ayuda a impedir el ingreso de humo a la caja de escalera y contribuye a proteger la vía de evacuación durante un incendio."
  },
  {
    "id": 10,
    "categoria": "Presurización de escaleras",
    "pregunta": "¿Alcanza con colocar un ventilador para presurizar correctamente una escalera?",
    "opciones": [
      {
        "id": "a",
        "texto": "Sí, cualquier ventilador es suficiente."
      },
      {
        "id": "b",
        "texto": "Sí, siempre que sea un ventilador grande."
      },
      {
        "id": "c",
        "texto": "No. Se requiere un proyecto técnico, cálculos y una instalación adecuada."
      }
    ],
    "correcta": "c",
    "explicacion": "Termoarq desarrolla proyectos de presurización bajo norma, con memoria de cálculo, planos ejecutivos e instalación de los sistemas."
  },
  {
    "id": 11,
    "categoria": "Calefacción",
    "pregunta": "¿Qué ventaja ofrece un sistema de calefacción por radiadores de agua caliente?",
    "opciones": [
      {
        "id": "a",
        "texto": "Permite calefaccionar ambientes y regular su temperatura mediante controles adecuados."
      },
      {
        "id": "b",
        "texto": "Sirve solamente para calentar agua sanitaria."
      },
      {
        "id": "c",
        "texto": "Necesita mantener las ventanas abiertas para funcionar."
      }
    ],
    "correcta": "a",
    "explicacion": "Los radiadores transmiten calor al ambiente y pueden contar con regulación individual mediante válvulas termostáticas y otros controles."
  },
  {
    "id": 12,
    "categoria": "Calefacción",
    "pregunta": "¿Un sistema de piso radiante por agua puede funcionar con una bomba de calor?",
    "opciones": [
      {
        "id": "a",
        "texto": "No, solamente funciona con calderas a gas."
      },
      {
        "id": "b",
        "texto": "Sí, puede funcionar con bombas de calor diseñadas para calefacción."
      },
      {
        "id": "c",
        "texto": "Solamente si el piso es de madera."
      }
    ],
    "correcta": "b",
    "explicacion": "El piso radiante utiliza temperaturas de agua relativamente bajas, lo que permite combinarlo con bombas de calor de alta eficiencia."
  },
  {
    "id": 13,
    "categoria": "Presurización de escaleras",
    "pregunta": "¿Cuándo debe funcionar un sistema de presurización de escaleras diseñado para protección contra incendios?",
    "opciones": [
      {
        "id": "a",
        "texto": "Solamente cuando hace calor."
      },
      {
        "id": "b",
        "texto": "De manera permanente para enfriar las escaleras."
      },
      {
        "id": "c",
        "texto": "Cuando se activa la condición de incendio prevista en el sistema de seguridad."
      }
    ],
    "correcta": "c",
    "explicacion": "Los sistemas de presurización para protección contra incendios se integran con las señales y controles correspondientes para operar ante una emergencia."
  },
  {
    "id": 14,
    "categoria": "Calefacción",
    "pregunta": "¿Qué se debe calcular antes de instalar radiadores o piso radiante?",
    "opciones": [
      {
        "id": "a",
        "texto": "Solamente la superficie del piso."
      },
      {
        "id": "b",
        "texto": "Realizar un balance térmico para determinar las pérdidas de calor del edificio y la potencia de calefacción necesaria."
      },
      {
        "id": "c",
        "texto": "Únicamente la cantidad de ventanas."
      }
    ],
    "correcta": "b",
    "explicacion": "El balance térmico permite dimensionar la calefacción, los emisores y los equipos de generación de calor."
  },
  {
    "id": 15,
    "categoria": "Presurización de escaleras",
    "pregunta": "¿Por qué es importante controlar la presión dentro de una escalera presurizada?",
    "opciones": [
      {
        "id": "a",
        "texto": "Porque una presión excesiva podría dificultar la apertura de las puertas de evacuación."
      },
      {
        "id": "b",
        "texto": "Porque cuanto mayor sea la presión, mejor funciona siempre el sistema."
      },
      {
        "id": "c",
        "texto": "Para reducir el consumo de iluminación."
      }
    ],
    "correcta": "a",
    "explicacion": "El sistema debe generar presión suficiente para limitar el ingreso de humo sin producir fuerzas de apertura de puertas superiores a las permitidas por la normativa."
  }
]

export function buscarPreguntaDesbloqueo(id: number): PreguntaDesbloqueo | undefined {
  return preguntasDesbloqueo.find(pregunta => pregunta.id === id)
}
