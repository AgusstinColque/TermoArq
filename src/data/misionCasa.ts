export type AmbienteCasa = 'living' | 'dormitorio' | 'escaleras'
export type OpcionCasa = 'a' | 'b' | 'c'
export interface PreguntaCasa { id: number; ambiente: AmbienteCasa; pregunta: string; opciones: { id: OpcionCasa; texto: string }[]; correcta: OpcionCasa; explicacion: string }
// Fuente: Mision_Termoarq_12_Preguntas_Completo.pdf, preguntas 1–6 y 10–12.
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
]
