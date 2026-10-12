// Pregunta de ejemplo del mockup. No se utiliza para clasificar contactos.
export const desafioInicial = {
  pregunta: 'Dos ambientes tienen el mismo tamaño. ¿Necesitan el mismo equipo de climatización?',
  opciones: [
    { id: 'superficie', texto: 'Sí, porque tienen la misma superficie.' },
    { id: 'factores', texto: 'No necesariamente: también influyen el sol, las ventanas y el aislamiento.' },
    { id: 'personas', texto: 'Sí, siempre que tengan la misma cantidad de personas.' },
  ],
  correcta: 'factores',
  explicacion: 'El sol, las ventanas y el aislamiento también influyen. Dos ambientes del mismo tamaño pueden necesitar equipos diferentes.',
} as const
