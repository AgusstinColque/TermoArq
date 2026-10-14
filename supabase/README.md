# Configuración de Supabase

Proyecto: TermoArq-Dev.
Dashboard: https://supabase.com/dashboard/project/yegoabfrihtefynupdhy

## Estado

El usuario confirmó que ejecutó la migración inicial en inglés. La segunda migración traduce el esquema al español; está preparada, pendiente de ejecutar y verificar en Supabase.

## Proyecto actual: siguiente paso

1. Abrir SQL Editor y una consulta nueva.
2. Ejecutar todo migrations/20261011000200_renombrar_esquema_espanol.sql.
3. Deben aparecer siete tablas con rls_activo=true.
4. Ejecutar tests/initial_permissions.sql para verificar permisos.
5. Confirmar el resultado antes de continuar con el backend.

No repetir la migración inicial ni borrar tablas. La segunda migración conserva registros, relaciones y permisos; traduce también los valores de juego y estado. Una anomalía cancela toda la transacción.

## Instalación futura en una base vacía

Ejecutar primero 20261011000100_initial_schema.sql y después 20261011000200_renombrar_esquema_espanol.sql, en ese orden. Se conserva la primera migración en inglés como historial del esquema ya aplicado.

## Tablas finales

| Tabla | Contenido |
|---|---|
| contactos | Nombre, apellido, teléfono/correo, aceptación y versiones de términos y privacidad. |
| participaciones | Contacto, juego, estado, fechas y respuesta de desbloqueo. |
| preguntas_comerciales | Preguntas; máximo tres posiciones habilitadas. |
| opciones_comerciales | Opciones vinculadas a cada pregunta. |
| respuestas_comerciales | Respuestas por participación y copia del texto presentado. |
| configuracion_experiencia | Juego activo, alcance del desbloqueo y habilitación de registros. |
| personal_autorizado | Usuarios de Supabase Auth habilitados para el panel. |

Los nombres propios de Supabase (auth.users, anon, authenticated, service_role, public y private) se conservan. Algunos nombres internos de restricciones quedan en inglés; sus referencias se actualizan al renombrar las tablas y columnas.

## Permisos

RLS en todas las tablas. Visitantes sin acceso directo. Cuentas autenticadas sin membresía no pueden leer datos. El personal puede consultar registros y modificar únicamente juego_activo. La gestión de membresías se realiza desde el servidor o SQL Editor, sin autoasignación de permisos.

Las pruebas utilizan cuentas ficticias dentro de una transacción que termina en rollback y no deja registros ni cambios.

## Próximos pasos

Implementar un endpoint para registrar contacto y participación en una sola transacción, validar respuestas, fijar el juego activo y controlar reintentos mediante solicitud_id. La entrada pública necesitará validación y control de abuso. El esquema por sí solo no habilita el formulario.

Crear/invitar al primer usuario desde Authentication y agregar su UUID a personal_autorizado. Configurar redirecciones al disponer de la URL de la aplicación.

Las claves secretas/service_role pertenecen exclusivamente al backend: nunca se guardan en variables VITE_* ni se comparten en el navegador.

## Pendientes

juego_activo y alcance_desbloqueo inician sin definir; registro_habilitado=false. No se cargaron contenidos ni premios de ejemplo. Ari debe aprobar preguntas, soluciones, desbloqueo y reglas de premios/stock.

No hay unicidad por teléfono o correo: sigue pendiente limitar participaciones por persona. Conservar preguntas utilizadas y crear nuevas versiones cuando cambien. Los textos de respuestas se guardan como copia de lo presentado.

Premios, resultados de ruleta y avances de ambientes se agregarán en migraciones posteriores; esta etapa cubre registro, preguntas y participaciones.

## Fuentes

- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/database/functions
- https://supabase.com/docs/guides/local-development/database-migrations


## Activar el guardado de pruebas en Supabase

1. Abrir el SQL Editor del proyecto y ejecutar supabase/migrations/20261011000300_registro_publico.sql una sola vez, después de las dos migraciones anteriores. No requiere login en la CLI ni claves secretas en el frontend.
2. La migración agrega códigos al catálogo, carga las opciones de ejemplo y habilita registros de prueba con ruleta. Si ya existen preguntas, aborta para no reemplazar el catálogo. Los textos legales siguen siendo borradores y se registran como borrador-1. Usar datos ficticios hasta revisar las condiciones.
3. Recorrer la aplicación y tocar Jugar. La web llama a registrar_visita mediante la clave pública. La función valida campos, consentimiento, tres opciones habilitadas y configuración. Guarda un contacto, una participación y tres respuestas en una sola transacción; devuelve únicamente el recibo y el juego. Las lecturas y escrituras directas de visitantes siguen bloqueadas.
4. Ante un error permanece en el desafío y ofrece Reintentar. La misma solicitud y contenido reutilizan el recibo, sin duplicar filas. Una edición del contenido genera otra solicitud. No se impone una participación única por persona.
5. Para pausar: UPDATE public.configuracion_experiencia SET registro_habilitado = false WHERE id = true;

La entrada RPC es pública con validaciones y un límite global de 120 registros nuevos por minuto. Ese límite reduce volumen, pero no autentica el dispositivo ni sustituye una protección contra abuso antes del evento. El endpoint no devuelve contactos. Faltan validación remota y protección adecuada a la publicación final.

## Ruleta de demostración

Premios indicados por Ari: voucher de descuento, bolsa sorpresa, llavero, soporte para celular, gorra y mate. Probabilidades iguales únicamente para la demostración; no hay stock, entrega real ni registro del resultado. Finalizar vuelve a la bienvenida y limpia los datos en memoria. El símbolo central se obtiene recortando el viewport del SVG auténtico, sin redibujar la marca.

Verificaciones: npm run test:db usa PostgreSQL embebido para ejecutar las tres migraciones y probar permisos anónimos, validación, guardado completo, rollback ante un fallo de inserción, reintentos, pausa y límite. Prueba de navegador con RPC simulada: fallo de guardado bloquea el juego, reintento conserva solicitud, éxito abre ruleta, el giro muestra un único resultado y Finalizar limpia el formulario. Diseño comprobado en vertical 1080 × 1920 y móvil 390 × 844, incluyendo movimiento reducido. Estas pruebas no confirman que la migración haya sido aplicada al proyecto remoto.
