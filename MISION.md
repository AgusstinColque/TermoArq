# Vista previa de Misión Termoarq

Local: `/?pantalla=mision`, solamente en desarrollo. Incluye el living; no activa el juego en el admin ni escribe resultados en Supabase.

## Referencias

Composición y mecánica: `mision-termoarq-preview-v1.html` aportado por el usuario. Paleta: `TERMOARQ - Propuesta 4.pdf`, colores #DFEFF7, #9BBEC8, #427D9D, #164863, #303030; Century Gothic principal y TT Chocolates secundaria. El fondo CSS y texto azul usan #164863. El HTML inicial usaba #103E50 y el logo SVG #004C67, ninguno sustituye la paleta del PDF. Las escenas rasterizadas conservan variaciones de iluminación azul. Century Gothic se usa cuando está instalada, Arial como alternativa; TT Chocolates no tiene archivo local autorizado y no se incorpora una fuente sustituta inventada.

## Parámetros del HTML

Lienzo de 1049×1500, ancho `min(100%,834px)`, unidades cqw. Sin zoom adicional, inclinación ni máscaras de polígonos. Casa arriba, opciones debajo.

Calor: left43%, top33%, width17%, height14%; mismos tres paths, 2.7s ease-in-out, desfases -0.9s/-1.8s; opacidad .25→.95→.15 y desplazamiento 12px→-10px.

Aire: left45%, top29%, width19%, height13%; mismos paths, trazo26/90, dashoffset -116 en1.8s lineales, desfases -.6s/-1.2s; aparece con transición .45s y espera .35s.

Opciones: left5.9%, width88.2%, height6.9%, top72.6/80.5/88.5%. Las posiciones se asignan por hijo de opciones, evitando el desplazamiento que causaba `nth-of-type` al contar también el botón de volver.

Climatización espera350ms, funde la escena resuelta en .45s, quita el calor y muestra el aire. Las alternativas incorrectas mantienen las opciones y muestran una pista. Siguiente ambiente señala el límite de la preview. Reiniciar restaura el living. Movimiento reducido quita animaciones/transiciones y muestra el resultado sin espera.

## Imágenes

`public/media/mision-escena-original.png` y `mision-escena-resuelta.png`: ImageGen sobre las dos imágenes embebidas en el HTML, conservando encuadre y equipo de la referencia y retirando texto/controles/efectos fijos. Los textos y efectos se dibujan en React. Prompts exactos embebidos y en archivos `.prompt.txt` junto a cada PNG. Referencias extraídas en el workspace de diseño `tmp/html-mision-0.png` y `tmp/html-mision-1.png`.

## Verificación

Build y lint. Recorrido incorrecta→pista→climatización→resultado→siguiente→reinicio en1440×900,390×844,1080×1920. Sin erroresJavaScript ni desborde horizontal. Capturas en `.impeccable/review/mision/`.

Ondas de fondo: tres trazos continuos y quietos de calor y tres de aire, con degradado suave, debajo de las ondas animadas. Se muestran y ocultan con el estado del ambiente; conservan su posición al reiniciar.

## Pantalla previa (12 de octubre)
La preview comienza con la casa completa y tres signos +. Sigue el mockup entregado: logo, lema, living destacado con calor animado, flecha hacia la tarjeta y botón Explorar ambiente. El + del living y el botón abren el desafío existente. Dormitorio y lavadero informan que estarán disponibles próximamente. La flecha del desafío vuelve a la vista general. El fondo mantiene #164863. Asset: mision-vista-superior.png, con prompt de procedencia adjunto. Verificado a 390, 1440 y 1080 píxeles de ancho; build, lint y navegación correctos.

Corrección de la previa: casa reconstruida desde el mockup con paredes completas y aberturas altas. La imagen conserva su proporción natural 3:2 mediante aspect-ratio y object-fit: contain; se elimina el achatamiento vertical anterior. Marcadores reajustados a los ambientes. Asset reemplazado con procedencia de ambos pasos de generación en su archivo de prompt.

Corrección de cámara de la previa: ángulo más bajo y frontal según el nuevo mockup de tablet; mayor presencia de fachadas y menor superficie de pisos. Se mantiene la proporción natural 3:2 y la interfaz existente. Asset y prompt actualizados.

## Presurización de escaleras
Tercer ambiente: una pregunta sorteada entre las 10–12 del PDF. Se conserva el criterio educativo existente: cualquier respuesta revela la solución y activa la demostración. Escena aprobada aislada en /media/mision-presurizacion.html, sin controles de demo: React controla activación y pausa mediante mensajes verificados por origen y ventana. Humo autónomo, puerta abierta, retroceso hacia el ambiente vecino, ventilador de impulsión y trazos de aire limpio. Carteles debajo de la imagen. No modifica Supabase ni la demo original de extracción.

## Experiencias separadas
Después del desbloqueo y el guardado, al entrar a Misión se asigna una experiencia mediante crypto.getRandomValues, 50 % casa y 50 % presurización. La selección se mantiene durante la participación. Casa completa solo living y dormitorio; presurización solo una pregunta del banco 10–12. La finalización regresa al inicio del flujo público. En desarrollo, ?pantalla=mision&experiencia=casa o experiencia=presurizacion permite revisar cada recorrido sin alterar el sorteo público.

## Desbloqueo por juego
Ruleta requiere dos preguntas distintas del mazo de Supabase; Misión conserva una. La segunda asignación tiene UUID derivado estable para reintentos, sin sorteos en el navegador. Se muestran explicación y Siguiente pregunta antes de Jugar. Si el registro confirma ruleta tras un cambio concurrente de juego, se completa la segunda antes de entrar. No requiere migraciones adicionales.

## Premio al completar Misión
Casa y presurización terminan en PremioMision antes de reiniciar la participación. Reutiliza las seis opciones, íconos, titulares, textos de retiro y sortearPremio de la ruleta (probabilidad uniforme). Un único sorteo por cierre; Finalizar entrega el control al flujo público o reinicia la vista de desarrollo. Se mantiene el carácter local de prueba de los premios, sin stock, persistencia o validación de entrega adicionales. La ruleta permanece intacta.

## Dos preguntas en presurización
Banco 10–22: se agregan las diez preguntas educativas 13–22 del DOCX de Ari con sus respuestas y explicaciones originales. Se sortean dos distintas sin reposición, estables durante la participación. Cada pregunta remonta su escena, reiniciando humo, ventilador y aire limpio. Primera respuesta → explicación → Siguiente pregunta; segunda respuesta → explicación → Ver mi premio. Casa y desbloqueo general sin cambios.
