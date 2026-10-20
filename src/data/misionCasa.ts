export type AmbienteCasa = 'living' | 'dormitorio' | 'escaleras'
export type OpcionCasa = 'a' | 'b' | 'c'
export interface PreguntaCasa { id: number; ambiente: AmbienteCasa; pregunta: string; opciones: { id: OpcionCasa; texto: string }[]; correcta: OpcionCasa; explicacion: string }
// Fuente: Mision_Termoarq_12_Preguntas_Completo.pdf, preguntas 1–6 y 10–22. Las preguntas 13–22 proceden de Mision_Termoarq_22_Preguntas_Educativas.docx.
export const preguntasCasa: PreguntaCasa[] = [
  {
    "id": 1,
    "ambiente": "dormitorio",
    "pregunta": "¿Qué es lo más importante para seleccionar correctamente un aire acondicionado para un dormitorio?",
    "opciones": [
      {
        "id": "a",
        "texto": "Elegir el equipo más grande disponible"
      },
      {
        "id": "b",
        "texto": "Calcular la capacidad necesaria según las características del ambiente"
      },
      {
        "id": "c",
        "texto": "Elegir el equipo de menor precio"
      }
    ],
    "correcta": "b",
    "explicacion": "La potencia adecuada permite mantener el confort, optimizar el consumo y mejorar la eficiencia energética."
  },
  {
    "id": 2,
    "ambiente": "dormitorio",
    "pregunta": "¿Qué temperatura se recomienda como referencia para climatizar eficientemente un dormitorio en verano?",
    "opciones": [
      {
        "id": "a",
        "texto": "18 °C"
      },
      {
        "id": "b",
        "texto": "24 °C"
      },
      {
        "id": "c",
        "texto": "16 °C"
      }
    ],
    "correcta": "b",
    "explicacion": "Alrededor de 24 °C suele ofrecer un buen equilibrio entre confort y ahorro energético."
  },
  {
    "id": 3,
    "ambiente": "dormitorio",
    "pregunta": "¿Dónde conviene instalar la unidad interior de un aire acondicionado?",
    "opciones": [
      {
        "id": "a",
        "texto": "Apuntando directamente hacia la cama"
      },
      {
        "id": "b",
        "texto": "En una posición que distribuya uniformemente el aire sin incidir directamente sobre las personas"
      },
      {
        "id": "c",
        "texto": "Lo más cerca posible del piso"
      }
    ],
    "correcta": "b",
    "explicacion": "Una correcta ubicación mejora la distribución del aire y evita corrientes molestas."
  },
  {
    "id": 4,
    "ambiente": "living",
    "pregunta": "¿Qué debemos considerar para climatizar un living-comedor amplio?",
    "opciones": [
      {
        "id": "a",
        "texto": "Solamente los metros cuadrados"
      },
      {
        "id": "b",
        "texto": "Superficie, altura, orientación, ventanas y cargas térmicas"
      },
      {
        "id": "c",
        "texto": "Únicamente la cantidad de personas"
      }
    ],
    "correcta": "b",
    "explicacion": "El cálculo de carga térmica permite seleccionar la potencia adecuada y lograr mayor eficiencia energética."
  },
  {
    "id": 5,
    "ambiente": "living",
    "pregunta": "¿Qué ventaja ofrece un sistema de climatización inverter?",
    "opciones": [
      {
        "id": "a",
        "texto": "Trabaja siempre a máxima potencia"
      },
      {
        "id": "b",
        "texto": "Regula la capacidad del compresor según la demanda térmica"
      },
      {
        "id": "c",
        "texto": "No necesita mantenimiento"
      }
    ],
    "correcta": "b",
    "explicacion": "La tecnología inverter adapta su funcionamiento a las necesidades del ambiente y ayuda a reducir el consumo."
  },
  {
    "id": 6,
    "ambiente": "living",
    "pregunta": "¿Qué sistema permite climatizar varios ambientes utilizando una sola unidad exterior?",
    "opciones": [
      {
        "id": "a",
        "texto": "Un equipo de ventana"
      },
      {
        "id": "b",
        "texto": "Un sistema multisplit o VRF"
      },
      {
        "id": "c",
        "texto": "Un extractor de aire"
      }
    ],
    "correcta": "b",
    "explicacion": "Los sistemas multisplit y VRF permiten climatizar varios ambientes con una única unidad exterior, optimizando el espacio y favoreciendo el ahorro energético."
  }
,
{
  "id": 10,
  "ambiente": "escaleras",
  "pregunta": "¿Cuál es la función principal de un sistema de presurización de escaleras en un edificio?",
  "opciones": [
    {
      "id": "a",
      "texto": "Enfriar las escaleras durante un incendio"
    },
    {
      "id": "b",
      "texto": "Evitar o limitar el ingreso de humo a las escaleras, permitiendo una evacuación más segura"
    },
    {
      "id": "c",
      "texto": "Extraer el aire caliente de todos los pisos"
    }
  ],
  "correcta": "b",
  "explicacion": "La presurización ayuda a mantener las vías de evacuación protegidas del ingreso de humo."
},
{
  "id": 11,
  "ambiente": "escaleras",
  "pregunta": "¿Cómo funciona un sistema de presurización de escaleras?",
  "opciones": [
    {
      "id": "a",
      "texto": "Inyecta aire exterior para generar una diferencia de presión positiva respecto de los sectores adyacentes"
    },
    {
      "id": "b",
      "texto": "Extrae todo el aire de la escalera para generar vacío"
    },
    {
      "id": "c",
      "texto": "Hace circular el mismo aire sin generar diferencias de presión"
    }
  ],
  "correcta": "a",
  "explicacion": "El sistema suministra aire para mantener una presión positiva controlada respecto de los espacios adyacentes."
},
{
  "id": 12,
  "ambiente": "escaleras",
  "pregunta": "¿Qué debemos considerar para seleccionar correctamente un ventilador de presurización?",
  "opciones": [
    {
      "id": "a",
      "texto": "Solamente la potencia del motor"
    },
    {
      "id": "b",
      "texto": "Elegir el ventilador de mayor tamaño disponible"
    },
    {
      "id": "c",
      "texto": "Realizar un cálculo según la normativa aplicable, considerando caudal, presión diferencial, fugas de aire y condiciones de puertas abiertas y cerradas"
    }
  ],
  "correcta": "c",
  "explicacion": "La selección debe basarse en un cálculo conforme a la normativa aplicable, verificando presiones, caudal y condiciones de operación."
}
,
{
  "id": 13,
  "ambiente": "escaleras",
  "pregunta": "¿Por qué el humo representa uno de los mayores peligros durante un incendio en un edificio?",
  "opciones": [
    {
      "id": "a",
      "texto": "Porque aumenta la temperatura exterior."
    },
    {
      "id": "b",
      "texto": "Porque puede dificultar la respiración y reducir la visibilidad."
    },
    {
      "id": "c",
      "texto": "Porque hace que los ascensores funcionen más rápido."
    }
  ],
  "correcta": "b",
  "explicacion": "El humo puede contener gases tóxicos, reducir la visibilidad y dificultar encontrar una salida, incluso lejos del foco del incendio."
},
{
  "id": 14,
  "ambiente": "escaleras",
  "pregunta": "¿Por qué algunos edificios necesitan escaleras especialmente protegidas contra el humo?",
  "opciones": [
    {
      "id": "a",
      "texto": "Para poder subir más rápido."
    },
    {
      "id": "b",
      "texto": "Para ofrecer a las personas una vía de evacuación más segura."
    },
    {
      "id": "c",
      "texto": "Para que los ascensores consuman menos energía."
    }
  ],
  "correcta": "b",
  "explicacion": "Las escaleras protegidas forman parte de las medidas de seguridad para facilitar la evacuación durante una emergencia."
},
{
  "id": 15,
  "ambiente": "escaleras",
  "pregunta": "¿A partir de qué altura puede exigirse una escalera protegida contra el humo?",
  "opciones": [
    {
      "id": "a",
      "texto": "Todos los edificios tienen exactamente la misma exigencia."
    },
    {
      "id": "b",
      "texto": "Depende de la altura, el uso del edificio y las normas de la jurisdicción."
    },
    {
      "id": "c",
      "texto": "Únicamente en edificios de más de 100 metros."
    }
  ],
  "correcta": "b",
  "explicacion": "Los 12 metros o aproximadamente cuatro niveles pueden ser una referencia en determinados contextos, pero no constituyen una obligación universal de instalar presurización. Debe verificarse el código local y el tipo de edificio."
},
{
  "id": 16,
  "ambiente": "escaleras",
  "pregunta": "¿Qué ocurre con el aire cuando se abre la puerta de una escalera presurizada?",
  "opciones": [
    {
      "id": "a",
      "texto": "Tiende a desplazarse hacia el sector de menor presión."
    },
    {
      "id": "b",
      "texto": "Se transforma en humo."
    },
    {
      "id": "c",
      "texto": "Se detiene toda la ventilación del edificio."
    }
  ],
  "correcta": "a",
  "explicacion": "El flujo de aire hacia el sector adyacente puede ayudar a limitar la entrada de humo cuando se abre una puerta durante la evacuación."
},
{
  "id": 17,
  "ambiente": "escaleras",
  "pregunta": "¿Un sistema de presurización de escaleras funciona igual que un aire acondicionado?",
  "opciones": [
    {
      "id": "a",
      "texto": "Sí, ambos se utilizan principalmente para enfriar."
    },
    {
      "id": "b",
      "texto": "No, la presurización está diseñada para proteger la escalera del ingreso de humo."
    },
    {
      "id": "c",
      "texto": "Sí, ambos eliminan las llamas."
    }
  ],
  "correcta": "b",
  "explicacion": "Un sistema de climatización busca confort térmico; la presurización es una medida de protección contra el humo."
},
{
  "id": 18,
  "ambiente": "escaleras",
  "pregunta": "¿Qué sistema puede activar automáticamente la presurización durante un incendio?",
  "opciones": [
    {
      "id": "a",
      "texto": "La detección y alarma de incendios."
    },
    {
      "id": "b",
      "texto": "El control remoto del aire acondicionado."
    },
    {
      "id": "c",
      "texto": "El interruptor de iluminación del pasillo."
    }
  ],
  "correcta": "a",
  "explicacion": "Muchos sistemas están vinculados a la detección de incendios para activarse ante una señal de emergencia."
},
{
  "id": 19,
  "ambiente": "escaleras",
  "pregunta": "¿Por qué las puertas de una escalera presurizada deben cerrar correctamente?",
  "opciones": [
    {
      "id": "a",
      "texto": "Para ayudar a mantener la presión prevista y limitar el ingreso de humo."
    },
    {
      "id": "b",
      "texto": "Para reducir la temperatura exterior."
    },
    {
      "id": "c",
      "texto": "Para evitar que funcionen los ascensores."
    }
  ],
  "correcta": "a",
  "explicacion": "Una puerta abierta puede alterar las diferencias de presión y reducir la eficacia de la protección."
},
{
  "id": 20,
  "ambiente": "escaleras",
  "pregunta": "¿Qué puede ocurrir si la presión de aire dentro de la escalera es demasiado elevada?",
  "opciones": [
    {
      "id": "a",
      "texto": "Las puertas pueden resultar difíciles de abrir."
    },
    {
      "id": "b",
      "texto": "Se apagan todas las luces."
    },
    {
      "id": "c",
      "texto": "El edificio consume menos electricidad."
    }
  ],
  "correcta": "a",
  "explicacion": "La presión debe controlarse para limitar el humo sin impedir que las personas abran las puertas."
},
{
  "id": 21,
  "ambiente": "escaleras",
  "pregunta": "¿Por qué es importante mantener periódicamente el sistema de presurización?",
  "opciones": [
    {
      "id": "a",
      "texto": "Porque debe encontrarse operativo cuando ocurra una emergencia."
    },
    {
      "id": "b",
      "texto": "Porque debe cambiarse todo el aire diariamente."
    },
    {
      "id": "c",
      "texto": "Porque permite que el edificio tenga más pisos."
    }
  ],
  "correcta": "a",
  "explicacion": "Las inspecciones y pruebas periódicas ayudan a verificar los ventiladores, controles y demás componentes de seguridad."
},
{
  "id": 22,
  "ambiente": "escaleras",
  "pregunta": "¿Quién debe definir si un edificio requiere presurización de escaleras?",
  "opciones": [
    {
      "id": "a",
      "texto": "El propietario según su preferencia."
    },
    {
      "id": "b",
      "texto": "Cualquier instalador sin realizar cálculos."
    },
    {
      "id": "c",
      "texto": "Un profesional mediante el proyecto y la normativa aplicable."
    }
  ],
  "correcta": "c",
  "explicacion": "La necesidad y el diseño deben evaluarse considerando exigencias locales, caudales, presión, uso del edificio y evacuación."
}
]
