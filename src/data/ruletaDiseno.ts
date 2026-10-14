// Geometría e íconos del HTML aportado por el usuario.
export const disenoRuleta = {
  "aspas": [
    "M323.000,303.235 Q367.867,145.780 124.084,146.584 A304 304 0 0 1 413.205,52.643 Q535.793,263.363 377.000,303.235 A54 54 0 0 0 323.000,303.235Z",
    "M377.000,303.235 Q535.793,263.363 413.205,52.643 A304 304 0 0 1 639.121,256.059 Q517.926,467.583 404.000,350.000 A54 54 0 0 0 377.000,303.235Z",
    "M404.000,350.000 Q517.926,467.583 639.121,256.059 A304 304 0 0 1 575.916,553.416 Q332.133,554.220 377.000,396.765 A54 54 0 0 0 404.000,350.000Z",
    "M377.000,396.765 Q332.133,554.220 575.916,553.416 A304 304 0 0 1 286.795,647.357 Q164.207,436.637 323.000,396.765 A54 54 0 0 0 377.000,396.765Z",
    "M323.000,396.765 Q164.207,436.637 286.795,647.357 A304 304 0 0 1 60.879,443.941 Q182.074,232.417 296.000,350.000 A54 54 0 0 0 323.000,396.765Z",
    "M296.000,350.000 Q182.074,232.417 60.879,443.941 A304 304 0 0 1 124.084,146.584 Q367.867,145.780 323.000,303.235 A54 54 0 0 0 296.000,350.000Z"
  ],
  "premios": [
    {
      "posicion": "translate(350.000,136.000)",
      "nombre": "Voucher de descuento",
      "lineas": ["Voucher de", "descuento"],
      "titular": "¡Ganaste un voucher de descuento!",
      "retiro": "Consultá las condiciones con el equipo de Termoarq.",
      "formas": [
        { "tipo": "path", "atributos": { "d": "M-27-23H27V-11Q18-9 18 0Q18 9 27 11V23H-27V11Q-18 9-18 0Q-18-9-27-11Z M-11-23V23" } },
        { "tipo": "circle", "atributos": { "cx": "0", "cy": "-8", "r": "3" } },
        { "tipo": "circle", "atributos": { "cx": "12", "cy": "8", "r": "3" } },
        { "tipo": "path", "atributos": { "d": "M-3 11L15-11" } }
      ]
    },
    {
      "posicion": "translate(535.329,243.000)",
      "nombre": "Bolsa sorpresa",
      "lineas": ["Bolsa", "sorpresa"],
      "titular": "¡Ganaste una bolsa sorpresa!",
      "retiro": "Retirala con el equipo de Termoarq.",
      "formas": [
        { "tipo": "path", "atributos": { "d": "M-25-11H25L29 28H-29Z M-13-11V-19a13 13 0 0 1 26 0V-11 M0-1V17 M-7 7H7" } }
      ]
    },
    {
      "posicion": "translate(535.329,457.000)",
      "nombre": "Llavero",
      "lineas": ["Llavero"],
      "titular": "¡Ganaste un llavero!",
      "retiro": "Retiralo con el equipo de Termoarq.",
      "formas": [
        { "tipo": "circle", "atributos": { "cx": "0", "cy": "-18", "r": "13" } },
        { "tipo": "circle", "atributos": { "cx": "0", "cy": "16", "r": "21" } },
        { "tipo": "path", "atributos": { "d": "M-4-5V-1M-8 16H8M0 8V24" } }
      ]
    },
    {
      "posicion": "translate(350.000,564.000)",
      "nombre": "Soporte para celular",
      "lineas": ["Soporte", "para celular"],
      "titular": "¡Ganaste un soporte para celular!",
      "retiro": "Retiralo con el equipo de Termoarq.",
      "formas": [
        { "tipo": "rect", "atributos": { "x": "-13", "y": "-30", "width": "26", "height": "40", "rx": "3" } },
        { "tipo": "path", "atributos": { "d": "M-4 4H4 M0 10V23 M-22 23H22 M-25 23L-29 28H29L25 23" } }
      ]
    },
    {
      "posicion": "translate(164.671,457.000)",
      "nombre": "Gorra",
      "lineas": ["Gorra"],
      "titular": "¡Ganaste una gorra!",
      "retiro": "Retirala con el equipo de Termoarq.",
      "formas": [
        { "tipo": "path", "atributos": { "d": "M-26 9V-2a26 24 0 0 1 52 0V9M-26 9Q0 2 26 9L36 18Q7 25-26 17Z M0-26V5" } }
      ]
    },
    {
      "posicion": "translate(164.671,243.000)",
      "nombre": "Mate",
      "lineas": ["Mate"],
      "titular": "¡Ganaste un mate!",
      "retiro": "Retiralo con el equipo de Termoarq.",
      "formas": [
        { "tipo": "path", "atributos": { "d": "M-22-12H22Q21 15 10 27H-10Q-21 15-22-12Z M-23-12Q0-18 23-12 M9-14L19-31 M19-31H29 M-9 27H9" } }
      ]
    }
  ]
} as const

export const simboloRuleta = [
  "M43.641,0H2.502C1.121,0.002,0.003,1.015,0,2.268v2.08c0.003,1.251,1.121,2.266,2.502,2.268h41.138\n\t\tc1.382-0.002,2.501-1.017,2.503-2.268v-2.08C46.142,1.015,45.023,0.002,43.641,0",
  "M43.684,10.321h-10.2h-0.001h-0.003c-5.386,0-10.299,2.198-13.824,5.73l-0.002,0.001\n\t\tc-3.53,3.523-5.728,8.435-5.729,13.82v11.725v0.916v6.899c0.003,1.358,1.102,2.458,2.461,2.46h1.697\n\t\tc1.357-0.002,2.456-1.102,2.459-2.46v-6.899v-0.916V29.883c0.001-3.582,1.446-6.804,3.792-9.152l0.002-0.003\n\t\tc2.349-2.344,5.571-3.791,9.154-3.791h10.196c1.357-0.002,2.458-1.103,2.46-2.46v-1.695C46.141,11.423,45.04,10.323,43.684,10.321",
  "M43.941,20.605h-2.212c-1.216,0.003-2.2,1.088-2.202,2.43v26.408c0.002,1.342,0.986,2.427,2.202,2.429\n\t\th2.212c1.216-0.002,2.201-1.088,2.203-2.429V23.035C46.142,21.694,45.157,20.608,43.941,20.605",
  "M32.398,34.34h-4.73c-0.876,0.001-1.587,0.712-1.589,1.591v4.73c0.002,0.878,0.713,1.589,1.589,1.59h4.73\n\t\tc0.878-0.001,1.589-0.712,1.59-1.59v-4.73C33.987,35.053,33.276,34.342,32.398,34.34"
] as const
