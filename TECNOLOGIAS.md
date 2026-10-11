# Tecnologías de Termoarq

Base tecnológica acordada para la experiencia táctil del stand y el panel privado de administración.

## Stack

| Parte | Tecnología | Propósito |
|---|---|---|
| Interfaz | React + TypeScript + Vite | Recorrido táctil, formularios y ambos juegos. |
| Estilos | CSS con variables de diseño | Reproducir los mockups y mantener colores, tipografía y espaciado coherentes. |
| Juegos | SVG, imágenes y animaciones CSS | Ruleta tipo turbina y casa isométrica con recursos livianos. |
| Datos | Supabase + PostgreSQL | Guardar contactos, respuestas y participaciones. |
| Administración | React + Supabase Auth | Panel privado, búsqueda, exportación y cambio manual del juego activo. |
| Lógica protegida | Funciones de PostgreSQL / Supabase | Validar registros y resolver premios y stock sin confiar en el navegador. |
| Hosting | Vercel | Publicar la web con HTTPS y una URL para abrir en la pantalla. |
| Código | GitHub | Versionado y respaldo del proyecto. |

## Arquitectura y comportamiento

- Experiencia pública del stand y panel privado para el personal.
- Cada visitante juega solamente al juego activo, seleccionado manualmente por el personal.
- Al finalizar se limpian los datos de la sesión en pantalla, conservando el registro en la base de datos.
- Autenticación y permisos de acceso a los datos aplicados en el backend.
- En la ruleta, el servidor determina el premio y la animación muestra ese resultado.
- Misión Termoarq utiliza ilustraciones y estados visuales de una casa isométrica de tres ambientes.

## Pantalla objetivo

Equipo de referencia: LG StanbyME de 27 pulgadas, modelo 27ART10AKPL, pantalla táctil Full HD de 1920 × 1080 y navegador integrado en webOS.

La primera opción es abrir la URL directamente en el navegador de la pantalla. Se ajustará la compatibilidad del JavaScript y CSS a la versión instalada. La orientación y el espacio útil deben confirmarse en el equipo real; las dimensiones del iPad de los mockups no son las dimensiones definitivas de desarrollo.

Se probarán apertura de la URL, pantalla completa u ocultación de barras, orientación, teclado, controles táctiles, animaciones, guardado de registros, errores de red y reinicio de la sesión.

No está confirmado el uso de una computadora externa. HDMI por sí solo no transmite los toques de la pantalla a una computadora.

## Diseño

Los mockups y la identidad aprobada de Termoarq tienen prioridad: logo auténtico, paleta coherente y controles fáciles de usar mediante tacto.

Paleta registrada: `#164863`, `#DFEFF7`, `#9BBEC8`, `#427D9D` y `#303030`.

Las skills no deben introducir efectos, decoración ni cambios que se alejen de lo aprobado. `gpt-taste`, `impeccable` y `emil-design-eng` no estaban disponibles en esta computadora al comprobarlas; se deben leer sus instrucciones antes de aplicarlas.

## Pendientes de definición o aprobación

- Exportación CSV: propuesta para la primera versión, sin aprobación específica todavía.
- Accesos del personal y detalle del mecanismo para cambiar el juego activo.
- Preguntas comerciales, desafíos, soluciones y explicaciones definitivas.
- Premios reales, cantidades, probabilidades y manejo del agotamiento del stock. No hay una regla confirmada de una participación por persona.
- Desbloqueo: el PDF lo muestra antes de ambos juegos; dejarlo solo antes de la ruleta sigue pendiente de aprobación de Ari.
- Orientación y validación en el navegador de la pantalla real.

## Elección de React + Vite

Se eligió React + Vite en lugar de Next.js porque el alcance actual se concentra en una experiencia interactiva y un panel privado, con Supabase como backend. No se requiere SEO para estas vistas. Next.js puede reconsiderarse si se incorpora una web institucional con contenido público o necesidades adicionales de servidor.
