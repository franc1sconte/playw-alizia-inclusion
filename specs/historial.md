# Validación del Historial de Conversaciones — Alizia asistente

## Resumen de la aplicación

En `https://alizia.educabot.ai/asistente`, el header (banner) incluye un botón **"Historial"** (ícono de reloj). Al hacer clic, despliega un panel lateral (`complementary`) con:

- Encabezado "Historial" y un botón **"Cerrar historial"** (X) para volver a ocultarlo. El botón del header mantiene siempre el mismo nombre accesible **"Historial"** (no alterna a "Cerrar historial": se verificó con `aria-label` y `getByRole` en ambos estados) y actúa como toggle: cada clic abre o cierra el panel. El botón "Cerrar historial" (X) es un elemento distinto, propio del panel, que solo cierra.
- El panel nunca pasa a `display:none` ni se desmonta: al cerrarse, el `<aside>` que lo contiene colapsa su ancho a `w-0` (con `overflow-hidden`), por lo que sus elementos hijos quedan con bounding box fuera del viewport pero technically siguen reportando `isVisible()/toBeVisible() === true` en Playwright (esa aserción no detecta el clipping del ancestro). Para verificar apertura/cierre del panel en los tests, usar `toBeInViewport()` sobre un elemento del panel (p. ej. el botón "Cerrar historial"), no `toBeVisible()`.
- Un buscador **"Buscar chat..."** (`textbox` "Buscar conversación") que filtra la lista en tiempo real por el texto del título de cada conversación.
- Una lista de conversaciones agrupada bajo el subtítulo "Últimos 7 días". Si no hay ninguna, se muestra el texto "Todavía no tenés conversaciones anteriores". Cada ítem es un botón con el título de la conversación (el texto del primer mensaje/chip que la originó) y un botón **"Más opciones"** que despliega un menú con **"Renombrar"** y **"Eliminar"**.

El panel de Historial **está cerrado por defecto** al entrar/recargar `/asistente` (aparece montado en el DOM pero fuera de vista; sólo se revela al togglear el botón). El estado de "panel abierto" y "cuál conversación se está viendo" **no persisten** a un `reload`: siempre se vuelve a la landing con el panel cerrado. En cambio, el **contenido** de las conversaciones sí persiste en el backend (`GET /api/v1/chat/history/assist,guided`), por lo que reabrir el mismo ítem del historial después de recargar muestra los mismos mensajes.

Al iniciar una conversación nueva (chip de acceso rápido o mensaje libre) aparece **inmediatamente** un nuevo ítem al tope del historial —incluso mientras el asistente todavía está generando la respuesta ("Consultando bibliografía especializada...", "Analizando el perfil del alumno...", etc.)—, sin esperar a que la respuesta del asistente llegue.

Dentro de una conversación (nueva o reabierta desde el historial) el header muestra "Alizia asistente" con los botones **"Volver"** (regresa a la landing) y **"Ver conversaciones anteriores"** (abre el mismo panel de Historial que el botón del header general).

> Nota sobre generación de recursos: para el flujo "Crear un recurso pedagógico", el asistente puede encadenar **varias rondas** de preguntas estructuradas (se observaron hasta 3 rondas de hasta 3 preguntas cada una durante la exploración) antes de llegar a generar un recurso pedagógico final; el número de rondas no es determinístico. El escenario 5 sobre accesibilidad de recursos generados dentro del historial asume que ya existe (o se genera aparte, posiblemente mockeando la respuesta de `/api/v1/inclusion/assist`) una conversación guardada cuya respuesta final incluye un recurso.

> Nota sobre cómo se ve un recurso pedagógico generado dentro del chat: una vez que el asistente termina de generarlo, el mensaje incluye el texto "Te lo dejo guardado en tus recursos." seguido de una **tarjeta clickeable** (rol `button`, sin `href`) con el título del recurso (p. ej. "Consignas en pasos para iniciar tareas en 4° B") y su categoría (p. ej. "Estrategia de aula"). Al hacer clic en esa tarjeta **no se navega ni se abre una pestaña nueva**: se abre un **panel lateral ("drawer") a la derecha**, con encabezado "Recurso pedagógico" y un botón "Cerrar", que ocupa el mismo espacio que el panel de Historial (lo reemplaza mientras está abierto; al cerrarlo con "Cerrar", el espacio queda vacío y el Historial **no** se reabre solo). El contenido del panel trae, en este orden: "Situación trabajada", "Adaptación generada" (con un chip de categoría), "Materiales" (chips con nombres de materiales relacionados) y una sección de recursos descargables cuyo título varía según el tipo de recurso (se observó "Paso a paso") con al menos un ítem descargable (ver escenario 5.2).
>
> Además del recurso pedagógico, el texto de la respuesta del asistente puede incluir **enlaces inline a "Materiales"** relacionados (p. ej. `Organizador de tareas personalizable`, con nombre accesible "Ver material: Organizador de tareas personalizable"). Son un elemento distinto: al clickearlos abren su propio panel lateral ("Material {nombre}") con categoría, una imagen o video de uso, "Descripción" y "Útil cuando el alumno". El escenario 5 de este plan se enfoca en la tarjeta del **recurso pedagógico**, no en estos enlaces de material.

Credenciales usadas: Admin (`admin@alizia.com` / `admin123`), cuenta con conversaciones previas en su historial.

## Test Scenarios

### 1. Apertura y cierre del panel de Historial

**Seed:** limpiar cookies/localStorage/sessionStorage del dominio; navegar a `https://alizia.educabot.ai/login`; loguearse con `admin@alizia.com` / `admin123`; confirmar llegada a `https://alizia.educabot.ai/asistente`.

#### 1.1. TC-101 abrir-panel-historial

**Precondiciones:** En `/asistente`, landing (sin conversación iniciada), panel de Historial cerrado.

**Pasos:**
  1. Hacer clic en el botón "Historial" del header.
    - expect: el panel lateral queda dentro del viewport (`toBeInViewport()` sobre el botón "Cerrar historial"), con el heading "Historial", el buscador "Buscar chat..." y el subtítulo "Últimos 7 días".
    - expect: si la cuenta tiene conversaciones previas, se lista al menos un ítem (botón con título + botón "Más opciones"); si no tiene ninguna, se muestra el texto "Todavía no tenés conversaciones anteriores".

#### 1.2. TC-102 cerrar-panel-historial-con-boton-cerrar

**Precondiciones:** Panel de Historial abierto (post 1.1).

**Pasos:**
  1. Hacer clic en el botón "Cerrar historial" (X) dentro del panel.
    - expect: el panel deja de estar dentro del viewport (`not.toBeInViewport()` sobre el botón "Cerrar historial").

#### 1.3. TC-103 cerrar-panel-historial-con-boton-toggle-del-header

**Precondiciones:** Panel de Historial abierto (post 1.1).

**Pasos:**
  1. Hacer clic de nuevo en el botón "Historial" del header (mismo botón que lo abrió; no cambia de nombre).
    - expect: mismo resultado que 1.2 — el panel deja de estar dentro del viewport.

---

### 2. Contenido del historial desplegado

**Seed:** igual que el Grupo 1 (login Admin, cuenta con conversaciones previas).

#### 2.1. TC-201 historial-desplegado-muestra-conversaciones-previas

**Precondiciones:** Login exitoso como Admin, en `/asistente`, panel de Historial cerrado. La cuenta tiene al menos una conversación previa.

**Pasos:**
  1. Hacer clic en el botón "Historial" para desplegar el panel.
    - expect: se lista al menos un ítem bajo el subtítulo "Últimos 7 días".
    - expect: cada ítem listado muestra un título no vacío y un botón "Más opciones".
    - expect: el buscador "Buscar chat..." está visible y vacío.

#### 2.2. TC-202 buscador-de-historial-filtra-por-texto

**Precondiciones:** Panel de Historial abierto, con al menos dos conversaciones de títulos distintos (p. ej. una que contenga "situación" y otra que no).

**Pasos:**
  1. Escribir en el buscador "Buscar chat..." un término presente sólo en el título de un subconjunto de conversaciones (p. ej. "situación").
    - expect: la lista se actualiza mostrando únicamente los ítems cuyo título contiene el término buscado.
    - expect: los ítems cuyo título no contiene el término dejan de listarse.

#### 2.3. TC-203 menu-mas-opciones-de-un-item-del-historial

**Precondiciones:** Panel de Historial abierto, con al menos un ítem listado.

**Pasos:**
  1. Hacer clic en el botón "Más opciones" de un ítem.
    - expect: se despliega un menú con las opciones "Renombrar" y "Eliminar".
  2. Cerrar el menú haciendo clic de nuevo en el mismo botón "Más opciones" (no ejecutar "Renombrar" ni "Eliminar": modificarían datos reales del historial). Nota: `Escape` y clickear otro elemento dentro del panel (p. ej. el heading "Historial") **no** cierran este menú — se verificó en la app real; solo lo cierra un clic en el propio botón toggle.
    - expect: el menú se cierra ("Renombrar" deja de estar visible) sin alterar el ítem ni su posición en la lista.

---

### 3. Nueva conversación se guarda en el historial

**Seed:** igual que el Grupo 1 (login Admin), landing sin conversación iniciada.

#### 3.1. TC-301 nueva-conversacion-por-chip-aparece-en-historial

**Precondiciones:** Login exitoso como Admin, en `/asistente`, landing sin conversación iniciada (los 4 chips visibles).

**Pasos:**
  1. Hacer clic en un chip de acceso rápido (p. ej. "Crear un recurso pedagógico").
    - expect: la petición `POST` a `.../api/v1/inclusion/assist` responde `200`.
    - expect: sin esperar a que el asistente termine de responder (mientras se muestra el estado de carga, p. ej. "Consultando bibliografía especializada..."), aparece un nuevo ítem al tope del panel de Historial (abrirlo si estaba cerrado) con el texto del chip como título.
  2. Hacer clic en "Volver".
    - expect: se regresa a la landing; el ítem de la conversación recién creada sigue siendo el primero listado en "Últimos 7 días" del historial.

#### 3.2. TC-302 nueva-conversacion-por-mensaje-libre-aparece-en-historial

**Precondiciones:** Login exitoso como Admin, en `/asistente`, landing sin conversación iniciada.

**Pasos:**
  1. Escribir un mensaje en el textbox "Mensaje para el asistente" y enviarlo (botón "Enviar mensaje").
    - expect: la petición `POST` a `.../api/v1/inclusion/assist` responde `200` con `message` igual al texto enviado.
    - expect: aparece un nuevo ítem al tope del panel de Historial con el texto del mensaje enviado como título.
  2. Hacer clic en "Volver".
    - expect: el ítem de la conversación recién creada sigue siendo el primero listado en "Últimos 7 días".

---

### 4. Persistencia de los datos de una conversación guardada

**Seed:** igual que el Grupo 1 (login Admin), cuenta con al menos una conversación previa en el historial.

#### 4.1. TC-401 reabrir-conversacion-guardada-muestra-mismo-contenido

**Precondiciones:** Login exitoso como Admin, en `/asistente`, panel de Historial abierto con al menos un ítem.

**Pasos:**
  1. Hacer clic en un ítem del historial.
    - expect: la vista cambia a la pantalla de conversación (header "Alizia asistente" con los botones "Volver" y "Ver conversaciones anteriores").
    - expect: el ítem clickeado queda visualmente marcado como seleccionado dentro de la lista del historial.
    - expect: se muestran en el cuerpo del chat el/los mensaje(s) de usuario y la(s) respuesta(s) del asistente correspondientes a esa conversación (no vacíos).

#### 4.2. TC-402 contenido-de-la-conversacion-persiste-tras-reload

**Precondiciones:** Una conversación del historial abierta (post 4.1), con su contenido visible.

**Pasos:**
  1. Registrar el contenido de los mensajes mostrados (texto del/los mensaje(s) de usuario y de la respuesta del asistente).
  2. Recargar la página (`reload`).
    - expect: la página vuelve a la landing de `/asistente`, con el panel de Historial cerrado.
  3. Abrir el panel de Historial y hacer clic en el mismo ítem de conversación.
    - expect: el contenido de la conversación (mensajes de usuario y respuesta del asistente) mostrado es idéntico al registrado en el paso 1.

---

### 5. Elementos generados en una conversación guardada son accesibles y clickeables

**Seed:** igual que el Grupo 1 (login Admin). Requiere además que exista en el historial una conversación cuya respuesta final del asistente incluya un recurso pedagógico generado (tarjeta con título + categoría, tras el texto "Te lo dejo guardado en tus recursos.") — ver nota sobre no determinismo del flujo de generación y sobre la estructura del preview en el Resumen. Si no existe una así, generarla antes del escenario (llevando el flujo "Crear un recurso pedagógico" hasta el final, respondiendo las rondas de preguntas) o mockear `/api/v1/inclusion/assist` para que la respuesta final incluya un recurso con estructura conocida.

#### 5.1. TC-501 recurso-pedagogico-generado-abre-su-preview-desde-historial

**Precondiciones:** En el historial existe una conversación guardada cuya respuesta del asistente incluye la tarjeta de un recurso pedagógico generado.

**Pasos:**
  1. Abrir el panel de Historial y hacer clic en esa conversación.
    - expect: se carga la conversación y se muestra, dentro de la respuesta del asistente, el texto "Te lo dejo guardado en tus recursos." seguido de la tarjeta del recurso (título + categoría, p. ej. "Estrategia de aula").
  2. Verificar que la tarjeta del recurso es un control interactivo (rol `button`, enfocable, sin `disabled`).
    - expect: la tarjeta expone un rol accesible interactivo y responde al foco de teclado.
  3. Hacer clic en la tarjeta del recurso.
    - expect: **no** se navega a otra URL ni se abre una pestaña nueva (la URL sigue siendo `/asistente`).
    - expect: se abre un panel lateral con el texto "Recurso pedagógico" (no es un heading ARIA, es texto plano — usar `getByText`) y un botón "Cerrar", reemplazando en su lugar al panel de Historial.
    - expect: el panel muestra, sin estar vacías, las secciones "Situación trabajada" y "Adaptación generada" (con un chip de categoría); si el recurso tiene materiales asociados, también se lista la sección "Materiales".
  4. Hacer clic en "Cerrar" dentro del panel del recurso.
    - expect: el panel se oculta (el espacio lateral queda sin panel; no se reabre el Historial automáticamente).

#### 5.2. TC-502 descarga-del-archivo-del-recurso-pedagogico-desde-el-preview

**Precondiciones:** Preview del recurso pedagógico abierto desde el historial (post paso 3 de 5.1), con una sección de recurso descargable visible (p. ej. "Paso a paso" con un ítem tipo "Guía de inicio rápido") cuyo ícono de descarga (⬇) está visible junto al nombre del archivo.

**Pasos:**
  1. Hacer clic en el ítem/botón de descarga del archivo dentro del panel del recurso.
    - expect: el navegador dispara un diálogo nativo `prompt` con el mensaje "Nombre del archivo" (manejar con `page.on('dialog', ...)` o el helper de diálogos del framework).
  2. Aceptar el diálogo, opcionalmente editando el nombre propuesto.
    - expect: se dispara una descarga real (evento `download` de Playwright) de un archivo `.pdf`.
    - expect: el nombre del archivo descargado refleja el valor aceptado en el diálogo (normalizado, p. ej. espacios reemplazados por guiones bajos).
  3. (Variante) Repetir los pasos 1 y 2 cancelando el diálogo (`dialog-dismiss` / `page.on('dialog', d => d.dismiss())`) en lugar de aceptarlo.
    - expect: no se dispara ningún evento de descarga ni error de consola; el panel del recurso permanece abierto sin cambios.
