# Validación de Chips de Acceso Rápido al Chat — Alizia asistente

## Resumen de la aplicación

En la landing del asistente (`https://alizia.educabot.ai/asistente`), además del textbox "Mensaje para el asistente", se muestran 4 "chips" (botones) de acceso rápido: "Adaptar una actividad para un alumno", "Tengo una situación difícil en el aula", "Crear un recurso pedagógico" y "No sé por donde empezar".

Al hacer clic en cualquiera de los 4 chips:
- El texto del chip se envía como el primer mensaje del usuario, iniciando una **conversación nueva** (no reutiliza ninguna conversación previa).
- La vista cambia de la landing a la pantalla de conversación, con un encabezado que incluye el botón "Volver" (regresa a la landing, con los 4 chips listos para iniciar otra conversación nueva) y el botón "Ver conversaciones anteriores".
- Se emite una petición `POST` a `https://alizia-inclusion-production.up.railway.app/api/v1/inclusion/assist`, con body `{ classroom_id, message: "<texto del chip>", history: [{ role: "user", content: "<texto del chip>" }], conversation_id: 0 }` (el chip 1 incluyó además `"mode":"guided"` en la petición observada; no se pudo confirmar si esto es determinístico o varía). La respuesta esperada es `200`, con body `{ description: { response, conversation_id, message_id, ... } }`.
- La conversación recién creada aparece como primer ítem del panel "Historial" → sección "Últimos 7 días", con el texto del chip como título.

Para 3 de los 4 chips ("Adaptar una actividad...", "Tengo una situación difícil...", "Crear un recurso pedagógico") la respuesta del backend incluye un array `questions` (2 a 3 preguntas estructuradas), que el front renderiza como un bloque paginado ("N de 3", botones "Pregunta anterior"/"Pregunta siguiente", botón "Descartar preguntas") mostrando una pregunta a la vez, con campo de respuesta libre y botón "Omitir pregunta" (algunas preguntas son de tipo `multiple` y agregan botones de respuesta rápida con las opciones, además del campo libre). Para el chip "No sé por donde empezar" el backend **no** devuelve `questions`, y el front muestra en su lugar un textbox libre ("Preguntale al asistente...") con botón de grabación de voz y botón de envío deshabilitado sin texto.

> Nota: el texto exacto de las respuestas del asistente proviene de un LLM y puede variar entre ejecuciones; las aserciones sobre el contenido textual de la respuesta deben tratarse como orientativas (o validarse de forma más laxa, ej. que el párrafo de respuesta no esté vacío) salvo el saludo/estructura, que sí es estable.

Credenciales usadas: Admin (`admin@alizia.com` / `admin123`).

## Test Scenarios

### 1. Chips de acceso rápido — inicio de conversación

**Seed:** limpiar cookies/localStorage/sessionStorage del dominio; navegar a `https://alizia.educabot.ai/login`; loguearse con `admin@alizia.com` / `admin123`; confirmar llegada a `https://alizia.educabot.ai/asistente` con los 4 chips visibles en la landing (sin conversación iniciada). Gerar mismos test con la cuenta de rol "teacher" `teacher2@alizia.com` / `teacher123` para tener cobertura en ambos roles.

#### 1.1. TC-001 chip-adaptar-actividad-alumno

**Precondiciones:** Login exitoso como Admin, en `/asistente`, landing sin conversación iniciada (los 4 chips visibles, textbox "Mensaje para el asistente" vacío, botón "Enviar mensaje" deshabilitado).

**Pasos:**
  1. Hacer clic en el botón "Adaptar una actividad para un alumno".

**Aserciones esperadas:**
  - Se emite una petición `POST` a `.../api/v1/inclusion/assist` con `message: "Adaptar una actividad para un alumno"`, y la respuesta HTTP es `200`.
  - La vista cambia a la pantalla de conversación: aparece el encabezado "Alizia asistente" con los botones "Volver" y "Ver conversaciones anteriores".
  - El mensaje de usuario mostrado en el chat es exactamente "Adaptar una actividad para un alumno".
  - Se muestra una respuesta del asistente (no vacía) con las acciones "Me gusta" / "No me gusta" / "Copiar" / "Favorito".
  - Se muestra un bloque de preguntas estructuradas con paginación ("1 de 3", botón "Pregunta anterior" deshabilitado, "Pregunta siguiente" habilitado), botón "Descartar preguntas", la primera pregunta con un campo de respuesta libre y un botón "Omitir pregunta".
  - Al hacer clic en "Volver", se regresa a la landing con los 4 chips visibles, y la conversación "Adaptar una actividad para un alumno" aparece como ítem en el panel "Historial" → "Últimos 7 días".

#### 1.2. TC-002 chip-situacion-dificil-aula

**Precondiciones:** Login exitoso como Admin, en `/asistente`, landing sin conversación iniciada.

**Pasos:**
  1. Hacer clic en el botón "Tengo una situación difícil en el aula".

**Aserciones esperadas:**
  - Se emite una petición `POST` a `.../api/v1/inclusion/assist` con `message: "Tengo una situación difícil en el aula"`, y la respuesta HTTP es `200`.
  - La vista cambia a la pantalla de conversación con el encabezado "Alizia asistente" ("Volver" / "Ver conversaciones anteriores").
  - El mensaje de usuario mostrado en el chat es exactamente "Tengo una situación difícil en el aula".
  - Se muestra una respuesta del asistente (no vacía) con las acciones "Me gusta" / "No me gusta" / "Copiar" / "Favorito".
  - Se muestra un bloque de preguntas estructuradas con paginación ("1 de 3"), la primera pregunta observada fue "¿Qué edad tiene?" con campo de respuesta libre y botón "Omitir pregunta"; las preguntas siguientes de este flujo incluyeron también botones de respuesta rápida (tipo `multiple`).
  - Al hacer clic en "Volver", la conversación "Tengo una situación difícil en el aula" aparece como nuevo ítem (el más reciente) en "Historial" → "Últimos 7 días", por encima de la conversación de 1.1.

#### 1.3. TC-003 chip-crear-recurso-pedagogico

**Precondiciones:** Login exitoso como Admin, en `/asistente`, landing sin conversación iniciada.

**Pasos:**
  1. Hacer clic en el botón "Crear un recurso pedagógico".

**Aserciones esperadas:**
  - Se emite una petición `POST` a `.../api/v1/inclusion/assist` con `message: "Crear un recurso pedagógico"`, y la respuesta HTTP es `200`.
  - La vista cambia a la pantalla de conversación con el encabezado "Alizia asistente" ("Volver" / "Ver conversaciones anteriores").
  - El mensaje de usuario mostrado en el chat es exactamente "Crear un recurso pedagógico".
  - Se muestra una respuesta del asistente (no vacía) con las acciones "Me gusta" / "No me gusta" / "Copiar" / "Favorito".
  - Se muestra un bloque de preguntas estructuradas ("1 de 3"); la primera pregunta observada fue "¿Es para un alumno en particular o para toda la clase?", de tipo `multiple`, mostrando botones de respuesta rápida con las opciones ("Para un alumno en particular" / "Para un grupo dentro de la clase" / "Para toda la clase") además de un campo de texto libre y un botón "Siguiente" (deshabilitado sin selección/texto).
  - Al hacer clic en "Volver", la conversación "Crear un recurso pedagógico" aparece como nuevo ítem (el más reciente) en "Historial" → "Últimos 7 días".

#### 1.4. TC-004 chip-no-se-por-donde-empezar

**Precondiciones:** Login exitoso como Admin, en `/asistente`, landing sin conversación iniciada.

**Pasos:**
  1. Hacer clic en el botón "No sé por donde empezar".

**Aserciones esperadas:**
  - Se emite una petición `POST` a `.../api/v1/inclusion/assist` con `message: "No sé por donde empezar"`, y la respuesta HTTP es `200`.
  - La vista cambia a la pantalla de conversación con el encabezado "Alizia asistente" ("Volver" / "Ver conversaciones anteriores").
  - El mensaje de usuario mostrado en el chat es exactamente "No sé por donde empezar".
  - Se muestra una respuesta del asistente (no vacía) con las acciones "Me gusta" / "No me gusta" / "Copiar" / "Favorito".
  - **A diferencia de los escenarios 1.1–1.3**, no se muestra ningún bloque de preguntas estructuradas paginadas; en su lugar aparece un textbox libre "Preguntale al asistente..." (con foco automático), un botón "Iniciar grabación de voz" y un botón de envío deshabilitado mientras el campo esté vacío.
  - Al hacer clic en "Volver", la conversación "No sé por donde empezar" aparece como nuevo ítem (el más reciente) en "Historial" → "Últimos 7 días", quedando las 4 conversaciones de este plan visibles en orden inverso al de creación (más reciente primero): "No sé por donde empezar", "Crear un recurso pedagógico", "Tengo una situación difícil en el aula", "Adaptar una actividad para un alumno".
