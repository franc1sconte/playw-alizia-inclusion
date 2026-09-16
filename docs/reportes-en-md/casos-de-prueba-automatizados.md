# Casos de prueba automatizados — Alizia Inclusión

Catálogo de los tests E2E automatizados con Playwright. No incluye tests deshabilitados con `.skip`
(actualmente todo `tests/api/students.spec.ts`, cuyo `describe` está en `.skip`) ni `tests/example.spec.ts`
(boilerplate por defecto de Playwright, no pertenece a la app).

Total: **40 casos activos** en 4 archivos.

## Login — `tests/login/alizia-inclusion-login.spec.ts`

| ID | Tag | Qué valida |
|---|---|---|
| TC-001-credenciales-incorrectas | @critical | Con contraseña incorrecta se muestra el mensaje de error de credenciales y la página permanece en `/login`. |
| TC-002-olvide-mi-contrasena-navega-a-recuperacion | @smoke | El botón "Olvidé mi contraseña" lleva a `/recuperar-contrasena` (con todos sus elementos visibles) y "Volver a Iniciar sesión" regresa a `/login`. |
| TC-003-login-exitoso-admin | @critical | Login con credenciales de Admin redirige a `/asistente` sin errores y el asistente saluda con el nombre correcto. |
| TC-004-login-exitoso-teacher | @critical | Login con credenciales de Teacher redirige a `/asistente`, saluda por nombre y muestra el modal de bienvenida "Alizia inclusión". |
| TC-005-cerrar-sesion | @critical | El menú de usuario muestra nombre, correo e institución, y "Cerrar sesión" redirige a `/login`. |

## Roles y navegación — `tests/rol/rol-access.spec.ts`

### Rol Admin

| ID | Tag | Qué valida |
|---|---|---|
| TC-001-navegacion-completa-visible-admin | @smoke | El Admin ve todos los links del menú (Alizia asistente, Primeros pasos, Materiales, Recursos pedagógicos, Aulas, Docentes, Feedback + WhatsApp), todos habilitados. |
| TC-002-acceso-alizia-asistente-admin | @critical | La landing del asistente muestra saludo, input de mensaje, los 4 chips de acceso rápido y el panel de historial. |
| TC-003-acceso-primeros-pasos-admin | @smoke | El módulo "Primeros pasos" carga en `/primeros-pasos` con su contenido (valija, accesos a asistente y materiales). |
| TC-004-acceso-materiales-admin | @smoke | El módulo "Materiales" carga en `/materiales` con buscador y filtros de categoría. |
| TC-005-acceso-recursos-pedagogicos-admin | @smoke | El módulo "Recursos pedagógicos" carga en `/recursos` con buscador, tabs de grupo y filtros de rango de tiempo. |
| TC-006-acceso-aulas-admin | @critical | El módulo "Aulas" (solo Admin) carga en `/admin/aulas`, lista aulas existentes y permite ver opciones de editar/eliminar. |
| TC-007-acceso-docentes-admin | @critical | El módulo "Docentes" (solo Admin) carga en `/admin/docentes`, lista docentes y permite ver la opción de dar de baja. |
| TC-008-acceso-feedback-admin | @smoke | El módulo "Feedback" (solo Admin) carga en `/admin/feedback` con filtros por valoración y listado de respuestas. |

### Rol Teacher

| ID | Tag | Qué valida |
|---|---|---|
| TC-009-navegacion-limitada-visible-teacher | @smoke | El Teacher solo ve los links permitidos (sin Aulas ni Docentes) en el menú. |
| TC-010-acceso-alizia-asistente-teacher | @critical | La landing del asistente para Teacher muestra saludo, chips de acceso rápido y accesos a las herramientas habilitadas. |
| TC-011-acceso-primeros-pasos-teacher | @smoke | El módulo "Primeros pasos" es accesible para Teacher. |
| TC-012-acceso-materiales-teacher | @smoke | El módulo "Materiales" es accesible para Teacher. |
| TC-013-acceso-recursos-pedagogicos-teacher | @smoke | El módulo "Recursos pedagógicos" es accesible para Teacher. |
| TC-014-aulas-no-accesible-por-url-teacher | @critical | Si un Teacher navega directo a `/admin/aulas` por URL, es redirigido a `/asistente` (no puede evadir el control de rol). |
| TC-015-docentes-no-accesible-por-url-teacher | @critical | Si un Teacher navega directo a `/admin/docentes` por URL, es redirigido a `/asistente` (no puede evadir el control de rol). |

## Chips de acceso rápido del asistente — `tests/assist/chat-assist.spec.ts`

Cada escenario se corre una vez para **Admin** y una vez para **Teacher** (8 tests en total).

| ID (sufijo `-admin` / `-teacher`) | Tag | Qué valida |
|---|---|---|
| TC-001-chip-adaptar-actividad-alumno | @critical | Al hacer clic en el chip "Adaptar una actividad para un alumno" se dispara la llamada al backend (`/api/v1/inclusion/assist`), se abre la conversación con el mensaje del chip, aparecen las acciones de respuesta (me gusta, no me gusta, copiar, favorito) y el follow-up adaptativo (preguntas o input libre), y al volver el chip y la conversación quedan en el historial. |
| TC-002-chip-situacion-dificil-aula | @critical | Igual que el anterior, para el chip "Tengo una situación difícil en el aula". |
| TC-003-chip-crear-recurso-pedagogico | @critical | Igual que el anterior, para el chip "Crear un recurso pedagógico". |
| TC-004-chip-no-se-por-donde-empezar | @critical | Igual que el anterior, para el chip "No sé por donde empezar". |

## Historial de conversaciones — `tests/asistente/historial.spec.ts`

> Corre en modo `serial` (todos los tests del archivo, en orden) porque comparten la misma cuenta Admin
> con historial existente; se recomienda `--workers=1` para ejecución multi-navegador confiable.

### Apertura y cierre del panel

| ID | Tag | Qué valida |
|---|---|---|
| TC-101-abrir-panel-historial | @critical | El botón de historial abre el panel, mostrando encabezado, buscador y las conversaciones de la última semana. |
| TC-102-cerrar-panel-historial-con-boton-cerrar | @critical | El botón "Cerrar" del panel lo cierra. |
| TC-103-cerrar-panel-historial-con-boton-toggle-del-header | @critical | El mismo botón que abre el panel (toggle del header) también lo cierra. |

### Contenido del historial desplegado

| ID | Tag | Qué valida |
|---|---|---|
| TC-201-historial-desplegado-muestra-conversaciones-previas | @critical | El panel muestra conversaciones previas con título y botón de "más opciones", y el buscador aparece vacío. |
| TC-202-buscador-de-historial-filtra-por-texto | @critical | Buscar un texto filtra el listado a solo las conversaciones que coinciden, ocultando el resto. |
| TC-203-menu-mas-opciones-de-un-item-del-historial | @critical | El menú de "más opciones" de un ítem muestra "Renombrar" y "Eliminar", y se cierra solo con un segundo clic en el mismo botón toggle. |

### Nueva conversación se guarda en el historial

| ID | Tag | Qué valida |
|---|---|---|
| TC-301-nueva-conversacion-por-chip-aparece-en-historial | @critical | Iniciar una conversación desde un chip de acceso rápido la agrega como primer ítem del historial. |
| TC-302-nueva-conversacion-por-mensaje-libre-aparece-en-historial | @critical | Iniciar una conversación escribiendo un mensaje libre la agrega como primer ítem del historial. |

### Persistencia de los datos de una conversación guardada

| ID | Tag | Qué valida |
|---|---|---|
| TC-401-reabrir-conversacion-guardada-muestra-mismo-contenido | @critical | Reabrir una conversación desde el historial la marca como activa (resaltado) y muestra su contenido. |
| TC-402-contenido-de-la-conversacion-persiste-tras-reload | @critical | El contenido de una conversación reabierta se mantiene igual después de recargar la página. |

### Elementos generados en una conversación guardada son accesibles y clickeables

| ID | Tag | Qué valida |
|---|---|---|
| TC-501-recurso-pedagogico-generado-abre-su-preview-desde-historial | @critical | Un recurso pedagógico generado en una conversación pasada se puede abrir en preview desde el historial, mostrando "Situación trabajada" y "Adaptación generada" con contenido, y se puede cerrar. |
| TC-502-descarga-del-archivo-del-recurso-pedagogico-desde-el-preview | @critical | Desde el preview del recurso, el botón de descarga genera un archivo `.pdf`; si se cancela el diálogo de descarga, no se dispara ningún archivo. |

## Excluidos de este catálogo

- `tests/api/students.spec.ts` — 11 casos (TC-001 a TC-011) de API de alumnos, notas y perfiles. Todo el `describe` está en `.skip`.
- `tests/example.spec.ts` — 2 tests de ejemplo por defecto de Playwright (contra playwright.dev), no relacionados con la app.
