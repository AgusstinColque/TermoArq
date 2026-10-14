# Revisión previa a la demostración — 13/10/2026

Proyecto revisado: C:\Users\Agustin\Desktop\TermoArq-Version-2.
Alcance: bienvenida, datos, preguntas comerciales, trivia, ruleta y administración.
La demostración utilizará datos ficticios, según confirmación del responsable.

## Resultado

El recorrido principal pasó las pruebas locales de compilación, PostgreSQL embebido y navegador con API simulada. Supabase remoto respondió a comprobaciones públicas sin escritura.
Esto no equivale a una aprobación de producción con personas y premios reales. No se hizo un registro remoto completo ni un ingreso remoto con la cuenta del administrador.

No se modificó el código de la aplicación en esta revisión. No se desplegó, cambió configuración remota ni cargaron contactos en Supabase.

## Pruebas terminadas

- npm run lint: pasó.
- npm run build: pasó.
- npm run test:db: pasó. Validación, permisos, idempotencia, rollback, pausa y límite de registros.
- npm run test:desafio: pasó. Banco de 15 preguntas y reparto compartido sin repetición dentro del ciclo.
- npm run test:admin: pasó. Permisos, revocación, filtros, fechas de Argentina, paginación y concurrencia de configuración.
- Excel: pasó con 226 visitas, filtros, teléfonos preservados, texto sin fórmulas, tabla y encabezados fijos.

Navegador Chrome actual, compilación de producción en 127.0.0.1:4173, contexto aislado y API simulada:
- Validación de campos obligatorios.
- Recorrido datos → preguntas → trivia → registro → ruleta.
- Fallo simulado de registro y reintento con idéntico UUID y contenido.
- Giro con transformación cambiante; no muestra premio anticipadamente.
- Resultado y Finalizar; el siguiente visitante encuentra el nombre vacío.
- Formulario y ruleta sin desbordamiento horizontal a 1080 × 1920.
- Login de admin, listado, aplicación de filtros y descarga .xlsx.
- Pausa del registro desde configuración y confirmación de guardado.
- Pantalla de configuración del admin sin desbordamiento horizontal a 320, 390 y 1440 px.
- Pantalla Mi cuenta y cierre de sesión. El cambio real de contraseña no se verificó.
- Sin excepciones JavaScript no controladas durante este recorrido.

Las comprobaciones de desbordamiento no sustituyen una revisión visual integral ni certifican legibilidad en el equipo físico.

Supabase remoto, solicitudes sin escritura:
- estado_experiencia: HTTP 200, disponible=true.
- asignar_desafio con UUID nulo: rechaza SOLICITUD_INVALIDA; función disponible.
- registrar_visita con solicitud nula: rechaza DATOS_INVALIDOS; función disponible.
- admin_listar_visitas sin sesión: acceso denegado (42501).
Esto no verifica todas las migraciones ni demuestra que una visita válida se guarde de extremo a extremo.

## Hallazgos pendientes

### Alta: recuperación tras un guardado de resultado incierto

src/App.tsx conserva solicitudRef al retroceder y editar datos. Si el servidor guardó la visita pero se perdió la respuesta, una nueva llamada con ese UUID y contenido editado será rechazada por SOLICITUD_CONFLICTO. El SQL protege correctamente contra duplicados; la interfaz no resuelve ese caso ni muestra un mensaje específico.

Para la demo: si falla el guardado, usar Reintentar sin editar ni reiniciar la página. Antes de producción, implementar una recuperación explícita que conserve el contenido enviado mientras su confirmación sea incierta. No cambiar el UUID automáticamente: podría duplicar una visita ya guardada.

### Alta: abandono en un puesto compartido

Los datos se limpian al Finalizar, pero no existe un reinicio por inactividad. Volver desde los datos a la bienvenida conserva el borrador. Un visitante posterior puede encontrar datos del anterior.

Para la demo supervisada, usar exclusivamente datos ficticios y finalizar cada recorrido. Antes del evento real, incorporar cancelación/reinicio y aviso de inactividad, contemplando las solicitudes en curso.

### Media: esperas de administración sin plazo propio

Las consultas del admin tienen cancelación en algunos componentes, pero no un tiempo máximo general. Una conexión que queda pendiente puede mantener la pantalla cargando o guardando. Añadir límites y recuperación, conservando la comprobación de concurrencia en configuración.

### Operación: autorización de la cuenta

Crear una cuenta en Authentication no autoriza el panel. Su UUID también debe estar en public.personal_autorizado. Ver ADMIN.md. Si el panel muestra Acceso pendiente, un administrador de la base debe ejecutar con el UUID correcto:

~~~sql
insert into public.personal_autorizado (usuario_id)
values ('UUID-DE-LA-CUENTA-AUTH')
on conflict (usuario_id) do nothing;
~~~

No compartir contraseñas ni claves secretas. La membresía real y el login de esa cuenta no fueron comprobados en esta revisión.

## Antes de presentar

1. Entrar con la cuenta real en /admin; confirmar contactos, Excel y Ruleta seleccionada con registro habilitado.
2. Completar una visita ficticia y comprobar que aparece en el admin remoto. Esta prueba aún no se ejecutó.
3. Probar bienvenida, reproducción del video, teclado táctil, scroll y giro en la LG vertical y con la conexión que se utilizará.
4. Usar un navegador/perfil separado para el admin y cerrar su sesión antes de entregar ese dispositivo al público; la sesión persiste.
5. Recordar que los accesos ?pantalla=ruleta y ?pantalla=mision son exclusivos del servidor de desarrollo y no funcionan como atajo en la compilación publicada.

## Antes de producción real

- Resolver los hallazgos de recuperación e inactividad.
- Validar el navegador y rendimiento del equipo real: una ventana de Chrome con dimensiones verticales no emula webOS.
- Completar y aprobar la información de privacidad y condiciones. El formulario está habilitado con vistaPrevia y las migraciones contienen versiones borrador.
- Confirmar reglas, disponibilidad y entrega de los seis premios. El sorteo es local en el navegador; no administra existencias ni registra la entrega.
- Revisar protección contra abuso de las funciones públicas antes de exponerlas ampliamente. El reparto de trivia no tiene un límite equivalente al registro.
- Realizar una prueba final contra el despliegue HTTPS real, incluyendo acceso directo y recarga de /admin.

La misión y la creación de imágenes quedaron fuera de esta revisión.

