# Superficie: administración Termoarq

Ruta `/admin`. Modo Operate: el personal autorizado consulta las visitas al stand y controla nuevos registros desde computadora o celular. Este registro describe la extensión implementada; no reemplaza la identidad del sitio ni define un nuevo sistema global.

## Propósito y recorrido

La primera vista verifica sesión y permisos, o presenta ingreso con email y contraseña. Tras autorizar, Contactos reúne búsqueda, filtros, acciones y resultados; Configuración muestra el estado vigente y permite guardar cambios explícitamente. La exportación abarca todos los resultados filtrados. Cada registro representa una visita, con sus respuestas comerciales guardadas. Activación, permisos y formatos: [ADMIN.md](../../ADMIN.md).

## Identidad y composición observadas

El SVG auténtico se muestra azul sobre blanco. Se heredan Arial, Helvetica, sans-serif y el azul principal `#164863` de `src/styles/global.css`. El panel agrega tonos funcionales locales: fondo `#f3f6f7`, texto secundario `#4b6472` y bordes `#ccd9df`; no los promueve a reglas del sitio público.

En computadora, cabecera con cuenta y cierre de sesión, navegación lateral de 216 px, contenido de hasta 1400 px y tabla de visitas. A 1100 px la navegación baja a 180 px. A 760 px pasa a navegación horizontal, resultados en lista y respuestas desplegables; búsqueda a ancho completo y filtros comerciales en una columna. Configuración limita la lectura a 820 px; login a 430 px.

Título de 1.75rem (1.5rem en móvil), subtítulos de 1.125rem, cuerpo de 1rem, controles de .9375rem y notas de .8125rem. Botones y campos tienen esquinas de 6 px; bloques de 8 px y login de 12 px. El sombreado suave queda en login; listas y formularios se separan mediante fondo y borde. Estados activos usan el azul; errores y confirmaciones incluyen texto explícito además del color.

## Interacción y estados

Acciones principales de al menos 44 px y campos de 46 px; foco visible con contorno de 3 px. Se incluyen salto al contenido, etiquetas, estados anunciados, selección de sección y foco al cambiar de pantalla. Carga, acceso pendiente, lista vacía, error y reintento, exportación cancelable, sesión y conflictos de configuración tienen salida explícita. Hover se aplica con puntero compatible; el comportamiento táctil no depende de hover.

## Evidencia y límites

Fuentes: `src/components/admin/AdminApp.tsx`, `ContactosAdmin.tsx`, `ConfiguracionAdmin.tsx`, `src/styles/admin.css` y `src/styles/global.css`. Capturas: `.impeccable/review/{desktop,mobile,mobile-respuestas,login-desktop,login-mobile,config-desktop,config-mobile}.png`. Verificación local informada en README y ADMIN; no confirma el estado remoto.

No se crea `DESIGN.md` ni su sidecar en esta extensión ordinaria. La ausencia previa de ese registro global y la advertencia del detector sobre Arial se reportan sin convertirlas en una nueva identidad; Arial sigue siendo la fuente provisional acordada.
