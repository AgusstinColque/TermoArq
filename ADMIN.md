# Panel de administración

Abrir `/admin` (o `/admin/`) en la misma aplicación. La experiencia pública conserva su diseño y recorrido. El panel carga su código y estilos por separado, y se adapta a computadora y celular.

## Funciones

- Login mediante email y contraseña de Supabase Auth, persistencia de sesión y cierre de sesión local.
- Autorización contra `personal_autorizado`, respaldada por RLS y comprobación en cada RPC. No usa metadatos editables para asignar permisos.
- Consulta de visitas con contacto y copia de las respuestas comerciales presentadas.
- Búsqueda por nombre, apellido, email o teléfono; filtros de fechas, servicio, proyecto y etapa.
- Paginación de 25 visitas. Una misma persona puede tener varias visitas; no se aplica deduplicación.
- Exportación de todas las visitas que coinciden con los filtros aplicados, en lotes de 200. Corte temporal estable, cancelación y protección frente a fórmulas en planillas. Excel (.xlsx) con cabecera de marca, filas alternadas, columnas amplias, textos ajustados, filtros de tabla y encabezados fijos. Teléfonos como texto y fechas con hora de Argentina. La biblioteca se carga únicamente al exportar.
- Selección de Ruleta, Misión Termoarq o juegos desactivados, y pausa/reanudación del registro, con detección de cambios concurrentes. Misión incluye el living y permite finalizar volviendo a la bienvenida; dormitorio y lavadero siguen en preparación.
- Los filtros comerciales usan el catálogo de ejemplos vigente. Las respuestas se muestran con los textos guardados al registrarse.

## Activación en Supabase

1. Confirmar que las tres migraciones anteriores están aplicadas; no repetirlas.
2. Ejecutar `supabase/migrations/20261012000100_panel_admin.sql` en SQL Editor.
3. Crear o invitar una cuenta de personal desde Authentication, con email y contraseña. Este panel no permite registro público ni alta de administradores.
4. Autorizar su UUID desde SQL Editor:

```sql
insert into public.personal_autorizado (usuario_id)
values ('UUID-DE-LA-CUENTA-AUTH')
on conflict (usuario_id) do nothing;
```

5. Ingresar en `/admin` y verificar consultas, exportación y configuración con una cuenta autorizada y otra sin autorización. Las cuentas sin membresía no pueden consultar ni modificar el panel.

La migración no autoriza cuentas automáticamente ni desactiva el modo de prueba. `modo_prueba` y las versiones de condiciones continúan bajo control del administrador de la base. Las claves secretas nunca se incorporan al frontend.

## Despliegue

En Vercel, `vercel.json` permite abrir `/admin` directamente y recargarlo como ruta de la SPA. Configurar las variables públicas de Supabase del proyecto.

## Verificación

- `npm run build`: TypeScript y compilación de producción.
- `npm run lint`: análisis estático.
- `npm run test:db`: registro público y permisos originales.
- `npm run test:admin`: permisos anónimos y de cuentas ajenas, revocación de membresía, filtros, fechas de Argentina, paginación, configuración concurrente y Excel.

Las pruebas locales usan PostgreSQL embebido y no prueban el estado del proyecto remoto. La comprobación visual con API simulada tampoco confirma la conexión remota. La activación y las cuentas de personal requieren verificación en Supabase.

## Cambio de contraseña

En el panel, abrir **Mi cuenta**. Ingresar la contraseña actual, una nueva de al menos 12 caracteres y su confirmación. Supabase Auth comprueba `current_password` y actualiza únicamente la cuenta conectada. Se respetan además los requisitos configurados en Supabase; ante una sesión que requiere reautenticación se pide volver a ingresar. Las contraseñas no se guardan en tablas de la aplicación ni se registran en logs. Los campos se limpian al completar el cambio.

No requiere una migración SQL nueva. No obliga al cambio inicial ni retira acceso al propietario de la base. Verificado localmente con Auth simulado: confirmación distinta bloquea la solicitud, contraseña actual incorrecta se rechaza, éxito limpia campos; computadora y móvil de 320 px sin desbordes. Falta comprobar este flujo contra la configuración del proyecto Supabase real.
## Integración de Misión y panel de gestión
Ejecutar una sola vez supabase/migrations/20261012000200_habilitar_mision.sql después de las anteriores. No cambia el juego seleccionado ni habilita registros automáticamente. Actualiza las dos funciones existentes y expone solamente la disponibilidad pública. Es necesaria antes de desplegar esta versión: Comenzar consulta la disponibilidad y el recibo de registrar_visita decide qué juego abrir. La pausa también se valida al guardar; solicitudes previamente confirmadas conservan su juego, incluso si luego se cambia o desactiva.

La migración fue verificada localmente con PostgreSQL embebido. Sigue pendiente aplicarla en el proyecto remoto. El panel conserva permisos, filtros, exportación y cuenta; agrega navegación lateral, resumen de visitas de la consulta, fecha de corte, etiquetas de juego y selección con estado publicado y cambios pendientes. Pruebas de navegador con datos simulados: 320/390/1440 px, login, permisos, filtros, paginación, Excel, selección/desactivación de juego, conflicto de configuración, contraseña, recorrido público y finalización de Misión.

## Trivia de desbloqueo V3

Ejecutar `supabase/migrations/20261012000300_trivia_desbloqueo.sql` después de `20261012000200_habilitar_mision.sql` **antes de publicar el frontend actualizado**. El desafío toma una de las 15 preguntas aprobadas del PDF V3. Supabase reparte un mazo común a Ruleta y Misión: el orden de cada vuelta es aleatorio, no repite preguntas dentro de las 15 asignaciones y evita repetir la última al iniciar la siguiente vuelta. Una solicitud conserva su pregunta al reintentar o volver atrás. El reparto ocurre al mostrar el desafío; una visita que abandona después de ver la pregunta igualmente consume ese turno del mazo.

La respuesta correcta y la explicación se muestran también después de un error, y cualquiera de los dos resultados habilita el botón **Jugar**. El número asignado se guarda en la tabla privada `asignaciones_desbloqueo`; la selección de la persona sigue siendo temporal, como en el desafío anterior. Si se editan o reordenan las preguntas, mantener estables los números 1–15 entre el frontend y la migración. Verificar el reparto con `npm run test:desafio`. La migración local no aplica cambios al proyecto Supabase remoto.

## Stock de premios (control interno)
Aplicar 20261021000100_stock_premios_interno.sql antes de publicar este frontend. Inicia las seis cantidades en cero. Personal autorizado puede editar cantidades y actualizar el listado. Cero no cambia el sorteo ni pausa juegos; el descuento se limita a cero. Sorteo y descuento se confirman juntos en obtener_premio, una vez por solicitud registrada. No hay estados de entrega ni avisos por stock bajo. Las vistas de desarrollo sin participación no descuentan stock. Las ediciones usan revisión para detectar descuentos o cambios concurrentes.
