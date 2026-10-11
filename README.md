# Termoarq

Base de la aplicación de la experiencia táctil del stand, creada con React, TypeScript y Vite. La documentación tecnológica y las migraciones existentes se conservan.

## Requisitos y comandos

Usar Node.js 22.12 o posterior de la rama 22, o una versión LTS posterior compatible con Vite. Entorno utilizado: Node.js 24.

- npm ci: instalar las versiones fijadas en package-lock.json.
- npm run dev: iniciar el servidor de desarrollo.
- npm run build: verificar TypeScript y generar dist/.
- npm run lint: revisar el código con Oxlint.
- npm run preview: previsualizar el resultado compilado.

## Supabase

Copiar .env.example como .env.local y completar VITE_SUPABASE_PUBLISHABLE_KEY con la clave pública sb_publishable_. La URL del proyecto ya está indicada.

Las variables VITE_* se incorporan al navegador: nunca incluir claves secretas ni service_role. .env.local está excluido de Git.

src/lib/supabase.ts prepara el cliente con inicialización diferida. La pantalla inicial no consulta la base ni confirma conectividad. Se configuró .env.local con la clave pública proporcionada y se verificó la conexión desde Chrome: la consulta pública a contactos fue rechazada con código 42501, según los permisos previstos. Esto no sustituye las pruebas del personal autorizado ni implementa el endpoint de registro.

## Alcance de esta etapa

Incluye estructura de aplicación, paleta acordada, cliente Supabase y bienvenida basada en el mockup con el logo SVG auténtico y el video proporcionado. El logo se presenta en blanco mediante CSS, conservando el SVG original. La tipografía es provisional hasta recibir los archivos del cliente.

Comenzar abre la pantalla de datos de contacto (paso 1 de 3), basada en el mockup vertical. Incluye nombre, apellido y un campo de teléfono o email con validaciones al salir del campo. La flecha permite volver y conserva el borrador únicamente en memoria de React: no se envía a Supabase hasta tocar Jugar; no se guarda en localStorage o sessionStorage. Recargar la página borra el borrador. Incluye además la pantalla de preguntas (paso 2 de 3). Incluye el desafío del paso 3 y su explicación. Incluye ruleta de demostración y cliente de registro mediante RPC. Todavía no incluye Misión Termoarq, login ni panel. El guardado remoto requiere ejecutar la migración de registro en Supabase.

Las migraciones y las pruebas de permisos están en supabase/. La migración inicial en inglés y el renombrado al español se mantienen en orden.

## Compatibilidad de la pantalla

La compilación apunta inicialmente a Chromium 79 como base conservadora, hasta confirmar la versión de webOS de la LG StanbyME. Esto no garantiza todas las APIs del navegador ni añade automáticamente polyfills. Se probarán orientación, teclado, tacto, animaciones y pantalla completa en el equipo real.

## Despliegue previsto

Vercel: comando de compilación npm run build, directorio de salida dist. Configurar las mismas variables públicas en el entorno de despliegue. Las rutas del panel y sus reglas de navegación se incorporarán al implementar esa parte.

## Referencias

- https://vite.dev/guide/
- https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
- https://supabase.com/docs/guides/getting-started/api-keys



## Video de bienvenida

- Archivo original: public/media/termoarq.mp4, Full HD 1920 × 1080, duración aproximada de 45 segundos y tamaño de 33 MB.
- Reproducción automática sin sonido, en bucle y dentro de la página.
- Sin controles visibles de reproducción; pausa al ocultar la pestaña y retoma al volver.
- Si falla la carga o la decodificación, permanece el fotograma local y se permite reintentar. Un bloqueo de autoplay conserva el video y ofrece reproducción mediante un toque.
- El video se reproduce en bucle también si el sistema tiene movimiento reducido, según el comportamiento solicitado para el stand. No se muestran botones de reproducción.
- El video ocupa solo el bloque de imagen del mockup, entre el logo y el texto. Usa object-fit: cover y oscurecimiento suave. La unión superior con la franja del logo se suaviza con un fundido de 48 px y el inferior con uno de 96 px; en móvil se reducen a 24 y 56 px.

Verificado en Chrome: autoplay, reinicio real al final del bucle, reproducción con movimiento reducido, reintento tras error de carga y recuperación tras bloqueo de autoplay. También se verificó distribución sin solapamientos ni desbordes en 1080 × 1920, 1920 × 1080 y 390 × 844. Compilación y análisis de código correctos. Pendiente de verificar en la LG StanbyME y de evaluar optimización del video para la red del evento.




## Datos de contacto

- Componente: src/components/DatosCliente.tsx. Validaciones: src/lib/datosContacto.ts.
- Se muestra una sola casilla inicialmente desmarcada: Acepto los términos y condiciones, con un texto desplegable en borrador sobre el estudio. Se retiró la opción de promociones; esta aceptación no se registra como autorización de marketing. Falta completar y revisar con Termoarq la identidad del responsable, domicilio, contacto para derechos, destinatarios, plazo y condiciones de recolección.
- El formulario de datos permite continuar a preguntas en vistaPrevia, después de validar los campos y la casilla. Esta navegación local no aprueba el aviso; el guardado se solicita al tocar Jugar y registra versiones identificadas como borrador en las pruebas. Fuera de vistaPrevia sigue requiriendo privacidadAprobada y onContinuar. El uso de datos para promociones queda pendiente de definir antes de implementar los envíos.
- El teléfono acepta código de país opcional y separadores habituales, con entre 7 y 15 dígitos. El email exige una estructura básica válida; esto no confirma la existencia de la casilla o la titularidad del contacto.
- Se verificaron en Chrome la navegación, conservación del borrador al volver, validación de teléfono/email y limpieza del error al corregir. La composición ocupa 1080 × 1920 sin desbordes y se adapta a 390 × 844 y 1920 × 1080. Compilación y análisis de código sin advertencias. Pendiente la prueba del teclado táctil en la pantalla real.



## Preguntas del proyecto

- Pantalla: src/components/PreguntasProyecto.tsx. Catálogo de ejemplo y validación: src/lib/preguntasProyecto.ts.
- Tres preguntas del mockup: servicio, tipo de proyecto y etapa. Se mantienen Climatización, Vivienda y Estoy planificando como opciones; ninguna respuesta empieza seleccionada.
- El usuario autorizó ampliar las opciones con ejemplos. Los servicios se basan en el sitio oficial: https://www.termoarq.com.ar/ y https://www.termoarq.com.ar/servicios_det.php?slug=servicios-de-ingenieria-y-construccion-hvac. Los tipos de proyecto y etapas adicionales son propuestas para revisar, no catálogo aprobado.
- Datos y selecciones se conservan en memoria al retroceder; Jugar solicita el guardado de contacto y respuestas. Recargar reinicia la vista previa.
- Continuar de preguntas valida las tres selecciones y abre el desafío del paso 3. El componente dispone de validación de opciones requeridas y rechaza valores fuera del catálogo.
- Verificado en Chrome: formulario de contacto vacío enfoca el primer error; un contacto válido y la aceptación permiten avanzar; selectores empiezan vacíos, corrigen errores al seleccionar y conservan respuestas al volver. Distribución sin desbordes horizontales en 1080 × 1920, 390 × 844 y 1920 × 1080. Compilación y análisis sin advertencias.
- Revisión de Impeccable: se conserva Arial provisional hasta recibir las fuentes originales. El detector señaló el borde del detalle de condiciones y la fuente provisional; no se reemplaza la identidad aprobada automáticamente por recomendaciones de estilo.

## Desafío antes de jugar

- Componente: src/components/Desafio.tsx. Pregunta de ejemplo: src/lib/desafioInicial.ts, reproducida del mockup.
- Tres opciones de respuesta excluyentes, ninguna premarcada. Responder sin elegir muestra un error y enfoca la primera opción.
- Respuesta incorrecta: No exactamente y explicación. Respuesta correcta: ¡Exactamente! y la misma explicación educativa. Ambos casos muestran Jugar; equivocarse no excluye al visitante.
- Jugar intenta guardar el registro mediante Supabase y abre la ruleta solo tras una confirmación válida. La flecha permite volver a la pregunta o a las preguntas comerciales, conservando las selecciones en memoria.
- Para el estudio comercial, los datos relevantes son contacto y respuestas sobre el proyecto. El acierto del desafío y los resultados del juego se consideran estado temporal de la experiencia, sin incorporarlos al perfil comercial. Si se requiere control de premios o stock, deberá definirse su registro operativo específico.
- La migración de registro incorpora una función que guarda contactos, participaciones y respuestas comerciales. El cliente no escribe directamente en las tablas ni envía la respuesta del desafío o el premio.
- Verificado en Chrome: selección obligatoria, corrección del error, respuesta correcta e incorrecta, explicación y navegación conservando respuestas. Diseño sin desbordes horizontales en 1080 × 1920, 390 × 844 y 1920 × 1080; en móvil se permite desplazamiento vertical cuando hace falta. Compilación y lint correctos.

## Activar el guardado de pruebas en Supabase

1. Abrir el SQL Editor del proyecto y ejecutar supabase/migrations/20261011000300_registro_publico.sql una sola vez, después de las dos migraciones anteriores. No requiere login en la CLI ni claves secretas en el frontend.
2. La migración agrega códigos al catálogo, carga las opciones de ejemplo y habilita registros de prueba con ruleta. Si ya existen preguntas, aborta para no reemplazar el catálogo. Los textos legales siguen siendo borradores y se registran como borrador-1. Usar datos ficticios hasta revisar las condiciones.
3. Recorrer la aplicación y tocar Jugar. La web llama a registrar_visita mediante la clave pública. La función valida campos, consentimiento, tres opciones habilitadas y configuración. Guarda un contacto, una participación y tres respuestas en una sola transacción; devuelve únicamente el recibo y el juego. Las lecturas y escrituras directas de visitantes siguen bloqueadas.
4. Ante un error permanece en el desafío y ofrece Reintentar. La misma solicitud y contenido reutilizan el recibo, sin duplicar filas. Una edición del contenido genera otra solicitud. No se impone una participación única por persona.
5. Para pausar: UPDATE public.configuracion_experiencia SET registro_habilitado = false WHERE id = true;

La entrada RPC es pública con validaciones y un límite global de 120 registros nuevos por minuto. Ese límite reduce volumen, pero no autentica el dispositivo ni sustituye una protección contra abuso antes del evento. El endpoint no devuelve contactos. Faltan validación remota y protección adecuada a la publicación final.

## Ruleta de demostración

Premios del mockup: gorra, taza, llavero, bolsa, libreta y lapicera. Probabilidades iguales únicamente para la demostración; no hay stock, entrega real ni registro del resultado. Finalizar vuelve a la bienvenida y limpia los datos en memoria. El símbolo central se obtiene recortando el viewport del SVG auténtico, sin redibujar la marca.

Verificaciones: npm run test:db usa PostgreSQL embebido para ejecutar las tres migraciones y probar permisos anónimos, validación, guardado completo, rollback ante un fallo de inserción, reintentos, pausa y límite. Prueba de navegador con RPC simulada: fallo de guardado bloquea el juego, reintento conserva solicitud, éxito abre ruleta, el giro muestra un único resultado y Finalizar limpia el formulario. Diseño comprobado en vertical 1080 × 1920 y móvil 390 × 844, incluyendo movimiento reducido. Estas pruebas no confirman que la migración haya sido aplicada al proyecto remoto.

### Desplazamiento
La rueda del mouse desacelera suavemente con requestAnimationFrame, sin dependencias nuevas. Los gestos táctiles, el teclado, los selectores y el modal conservan el comportamiento nativo. Cada cambio de pantalla vuelve al inicio; también lo hace la explicación del desafío. La preferencia de movimiento reducido desactiva el suavizado. La barra usa los colores de la marca y es más fina con puntero táctil.
Verificado en Chrome: destino e interrupción del scroll, navegación entre formularios y explicación, ausencia de desborde horizontal y errores de JavaScript. La sensación del gesto y el teclado virtual se deben comprobar en la LG física.

### Acceso directo a la ruleta en desarrollo
Con `npm run dev`, abrir `http://localhost:5173/?pantalla=ruleta`. Permite revisar y girar la ruleta sin completar formularios ni guardar registros en Supabase. Finalizar reinicia la ruleta para repetir la prueba. La URL habitual conserva el recorrido completo. Este acceso se desactiva en la compilación de producción.

### Ruleta basada en el HTML aportado
La referencia vigente es `ruleta-turbina-web-v1.html`, aportada por el usuario. Se portaron a React las seis aspas originales, las posiciones e íconos SVG, la composición, los colores, la activación de 180 ms, el modal con ilustración y marca. El acabado visual y el movimiento se actualizaron luego al relieve 2.5D aprobado. La geometría exacta se conserva en `src/lib/ruletaDiseno.ts`; los estilos están aislados en `src/styles/ruleta.css`.
Se mantienen las correcciones solicitadas: alternancia uniforme hasta el resultado, resaltado únicamente de la ganadora y nombres/íconos derechos mediante contrarrotación. El sorteo sigue usando crypto.getRandomValues con la misma probabilidad para los seis ejemplos. Con movimiento reducido se conserva un giro visible de 3,2 segundos sin desenfoque; el HTML original entregaba el resultado en 180 ms. El resultado se abre 700 ms después de detenerse. Finalizar sigue el recorrido de la aplicación: bienvenida en el uso normal, nueva ruleta en el acceso de desarrollo. No guarda resultados ni asigna entregas reales.
Verificado en Chrome: las seis posiciones ganadoras quedan bajo el puntero, orientación durante el giro, aire, modal, bloqueo, reinicio y ausencia de desbordes en 834×1194, 1080×1920 y 390×844. Falta comprobar el rendimiento en la LG física.


### Relieve 2.5D aprobado
Vista frontal con carcasa biselada, cavidad oscura, espesor bajo las aspas y tapa central elevada. Materiales SVG con iluminación azul y reflejos moderados; se mantienen geometría y posiciones del prototipo. Las líneas de aire se retiraron. El rotor acelera y frena en 4,8 segundos; solo las aspas reciben un desenfoque máximo de 0,7 px durante la velocidad alta. Íconos y nombres permanecen derechos y nítidos. Movimiento reducido conserva el giro de 3,2 segundos sin desenfoque. Verificadas las seis posiciones ganadoras, orientación, modal y reinicio en Chrome; queda comprobar el rendimiento en el hardware LG.

### Aire frontal en Canvas
`AireTurbina.tsx` agrega estelas blancas y azul hielo con expansión, curvatura y suavidad creciente. La intensidad sigue el tiempo de la animación real del rotor y desaparece durante el frenado. Usa dos texturas pequeñas precalculadas, hasta 18 estelas (14 en pantallas pequeñas, 6 con movimiento reducido) y una densidad máxima de 1,5. No intercepta toques ni altera posiciones o probabilidades. Detiene el dibujo cuando la página o el escenario no están visibles y libera observadores y requestAnimationFrame al terminar o desmontarse.
Verificado en Chrome: transparencia inicial y final, estelas visibles durante el giro, límite de resolución, ausencia de animación pendiente al terminar, reinicio y cero desbordes/errores. La fluidez final debe comprobarse en la LG física.

El aire se reforzó tras la revisión visual: estelas más largas y anchas, mayor contraste y expansión fuera de la carcasa. Usa hasta 30 estelas (24 en pantallas pequeñas, 12 con movimiento reducido), manteniendo el reloj del giro y la limpieza al finalizar. El contenedor recorta el desborde horizontal de las ráfagas.
