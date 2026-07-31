# Validación de Roles y Accesibilidad de Módulos — Alizia Inclusión

## Resumen de la aplicación

Alizia (`https://alizia.educabot.ai/`) es "tu asistente para aulas más inclusivas" (Educabot). Tras autenticarse, tanto el rol Admin como el rol Teacher llegan a `/asistente`, pero el menú de navegación lateral difiere según el rol:

- **Admin** ve 6 módulos: "Alizia asistente", "Primeros pasos", "Materiales", "Recursos pedagógicos", "Aulas" y "Docentes".
- **Teacher** ve solo 4 módulos: "Alizia asistente", "Primeros pasos", "Materiales" y "Recursos pedagógicos" — sin "Aulas" ni "Docentes".

Este plan cubre, para cada rol: que los módulos correctos estén visibles en la navegación, que cada uno navegue a la URL esperada, y que el contenedor/estructura padre de cada vista se renderice correctamente (validación superficial, no de profundidad). También valida que las secciones exclusivas de Admin no sean accesibles para Teacher mediante navegación directa por URL.

**Credenciales usadas:**
- Admin: `admin@alizia.com` / `admin123`
- Teacher: `teacher2@alizia.com` / `teacher123` (cuenta de "Carlos Domínguez")

**Nota de exploración:** antes de cada login se debe limpiar cookies, localStorage y sessionStorage del dominio (`cookie-clear`, `localstorage-clear`, `sessionstorage-clear` + reload) para partir de un estado limpio, sin sesión ni caché previa.

## Test Scenarios

### 1. Rol Admin — Navegación y módulos

**Seed:** limpiar cookies/localStorage/sessionStorage del dominio; navegar a `https://alizia.educabot.ai/login`; loguearse con `admin@alizia.com` / `admin123`.

#### 1.1. navegacion-completa-visible-admin

**Precondiciones:** Sesión limpia. Login exitoso como Admin, en `https://alizia.educabot.ai/asistente`.

**Pasos:**
  1. Observar la barra de navegación lateral inmediatamente después del login.

**Aserciones esperadas:**
  - La navegación muestra exactamente 6 enlaces, en este orden: "Alizia asistente", "Primeros pasos", "Materiales", "Recursos pedagógicos", "Aulas" y "Docentes".
  - Cada enlace es visible y clickeable (no deshabilitado).
  - El botón "Menú de usuario" (avatar con inicial "A") está presente en la navegación.

#### 1.2. acceso-alizia-asistente-admin

**Precondiciones:** Login exitoso como Admin, en `/asistente`.

**Pasos:**
  1. Hacer clic en el enlace "Alizia asistente" de la navegación (o partir directamente de la landing post-login).

**Aserciones esperadas:**
  - La URL corresponde a `https://alizia.educabot.ai/asistente`.
  - Se muestra el saludo "Hola Administrador," y el texto "¿Cómo puedo ayudarte?".
  - Se muestra el textbox "Mensaje para el asistente" con los botones "Dictar mensaje" y "Enviar mensaje" (deshabilitado sin texto).
  - Se muestran los 4 accesos rápidos: "Adaptar una actividad para un alumno", "Tengo una situación difícil en el aula", "Crear un recurso pedagógico", "No sé por donde empezar".
  - El panel lateral "Historial" es visible, con el buscador "Buscar conversación".

#### 1.3. acceso-primeros-pasos-admin

**Precondiciones:** Login exitoso como Admin, en `/asistente`.

**Pasos:**
  1. Hacer clic en el enlace "Primeros pasos" de la navegación.

**Aserciones esperadas:**
  - La URL corresponde a `https://alizia.educabot.ai/primeros-pasos`.
  - El enlace "Primeros pasos" queda marcado como activo en la navegación.
  - Se muestra el encabezado "Primeros pasos" (h1).
  - Se muestra la sección "La valija" (h2) con su descripción, y el bloque "Explorá tu valija" con accesos a "Tu asistente de aula" e "Ir a Materiales".

#### 1.4. acceso-materiales-admin

**Precondiciones:** Login exitoso como Admin, en `/asistente`.

**Pasos:**
  1. Hacer clic en el enlace "Materiales" de la navegación.

**Aserciones esperadas:**
  - La URL corresponde a `https://alizia.educabot.ai/materiales`.
  - Se muestra el encabezado "Materiales" (h1) y el buscador "Buscar material".
  - Se muestran los botones de filtro por categoría: "Todos", "Regulación", "Atención", "Organización", "Lecto-escritura", "Tecnología".
  - Se muestra el listado de materiales agrupado por categoría (secciones expandibles con encabezado y cantidad, ej. "Regulación sensorial y motriz — 3 materiales").

#### 1.5. acceso-recursos-pedagogicos-admin

**Precondiciones:** Login exitoso como Admin, en `/asistente`.

**Pasos:**
  1. Hacer clic en el enlace "Recursos pedagógicos" de la navegación.

**Aserciones esperadas:**
  - La URL corresponde a `https://alizia.educabot.ai/recursos`.
  - Se muestra el encabezado "Recursos pedagógicos" (h1) y el botón "Crear nuevo recurso".
  - Se muestra el buscador "Buscar recursos" y la lista de tabs "Agrupar recursos": "Recientes" (seleccionado por defecto), "Materiales", "Alumnos", "Necesidades".
  - Se muestra el filtro por rango de tiempo: "Todos" (presionado por defecto), "Hoy", "Esta semana", "Este mes".
  - Se muestra el listado de recursos dentro del panel de la pestaña activa.

#### 1.6. acceso-aulas-admin

**Precondiciones:** Login exitoso como Admin, en `/asistente`.

**Pasos:**
  1. Hacer clic en el enlace "Aulas" de la navegación.

**Aserciones esperadas:**
  - La URL corresponde a `https://alizia.educabot.ai/admin/aulas`.
  - Se muestra el botón "Volver", el encabezado "Aulas" (h1) con el subtítulo "Gestión de aulas de la institución", y el botón "Nueva aula".
  - Se muestra el listado de tarjetas de aulas, cada una con nombre (ej. "1ro A") y acciones "Editar aula ..." / "Eliminar aula ...".

#### 1.7. acceso-docentes-admin

**Precondiciones:** Login exitoso como Admin, en `/asistente`.

**Pasos:**
  1. Hacer clic en el enlace "Docentes" de la navegación.

**Aserciones esperadas:**
  - La URL corresponde a `https://alizia.educabot.ai/admin/docentes`.
  - Se muestra el botón "Volver", el encabezado "Docentes" (h1) con el subtítulo "N docentes en la institución", y el botón "Nuevo docente".
  - Se muestra el listado de docentes, cada uno con nombre, correo electrónico, rol ("Docente") y acción "Dar de baja a ...".

### 2. Rol Teacher — Navegación y módulos

**Seed:** limpiar cookies/localStorage/sessionStorage del dominio; navegar a `https://alizia.educabot.ai/login`; loguearse con `teacher2@alizia.com` / `teacher123`; cerrar el modal de bienvenida ("Alizia inclusión" → botón "Continuar") si aparece.

#### 2.1. navegacion-limitada-visible-teacher

**Precondiciones:** Sesión limpia. Login exitoso como Teacher, en `https://alizia.educabot.ai/asistente`, sin el modal de bienvenida abierto.

**Pasos:**
  1. Observar la barra de navegación lateral.

**Aserciones esperadas:**
  - La navegación muestra exactamente 4 enlaces, en este orden: "Alizia asistente", "Primeros pasos", "Materiales" y "Recursos pedagógicos".
  - **No** se muestran los enlaces "Aulas" ni "Docentes".
  - El botón "Menú de usuario" (avatar con inicial "C") está presente.

#### 2.2. acceso-alizia-asistente-teacher

**Precondiciones:** Login exitoso como Teacher, en `/asistente`, modal de bienvenida cerrado.

**Pasos:**
  1. Hacer clic en el enlace "Alizia asistente" de la navegación (o partir directamente de la landing post-login).

**Aserciones esperadas:**
  - La URL corresponde a `https://alizia.educabot.ai/asistente`.
  - Se muestra el saludo "Hola Carlos," y el texto "¿Cómo puedo ayudarte?".
  - Se muestran los mismos 4 accesos rápidos que ve Admin.
  - Se muestra además la sección "Accesos a tus herramientas" con tarjetas hacia "Primeros pasos", "Materiales" y "Recursos pedagógicos" (sección no observada en la vista de Admin).

#### 2.3. acceso-primeros-pasos-teacher

**Precondiciones:** Login exitoso como Teacher, en `/asistente`.

**Pasos:**
  1. Hacer clic en el enlace "Primeros pasos" de la navegación.

**Aserciones esperadas:**
  - La URL corresponde a `https://alizia.educabot.ai/primeros-pasos`.
  - Se muestra el mismo contenedor base que para Admin: encabezado "Primeros pasos" (h1), sección "La valija" (h2) y el bloque "Explorá tu valija".

#### 2.4. acceso-materiales-teacher

**Precondiciones:** Login exitoso como Teacher, en `/asistente`.

**Pasos:**
  1. Hacer clic en el enlace "Materiales" de la navegación.

**Aserciones esperadas:**
  - La URL corresponde a `https://alizia.educabot.ai/materiales`.
  - Se muestra el mismo contenedor base que para Admin: encabezado "Materiales" (h1), buscador "Buscar material", filtros por categoría y listado agrupado.

#### 2.5. acceso-recursos-pedagogicos-teacher

**Precondiciones:** Login exitoso como Teacher, en `/asistente`.

**Pasos:**
  1. Hacer clic en el enlace "Recursos pedagógicos" de la navegación.

**Aserciones esperadas:**
  - La URL corresponde a `https://alizia.educabot.ai/recursos`.
  - Se muestra el mismo contenedor base que para Admin: encabezado "Recursos pedagógicos" (h1), botón "Crear nuevo recurso", buscador, tabs "Agrupar recursos" y filtro por rango de tiempo.

#### 2.6. aulas-no-accesible-por-url-teacher

**Precondiciones:** Login exitoso como Teacher.

**Pasos:**
  1. Navegar directamente (por URL) a `https://alizia.educabot.ai/admin/aulas`.

**Aserciones esperadas:**
  - La aplicación redirige automáticamente a `https://alizia.educabot.ai/asistente` (no se muestra el contenido de "Aulas").
  - La navegación lateral sigue mostrando solo los 4 módulos permitidos para Teacher.

#### 2.7. docentes-no-accesible-por-url-teacher

**Precondiciones:** Login exitoso como Teacher.

**Pasos:**
  1. Navegar directamente (por URL) a `https://alizia.educabot.ai/admin/docentes`.

**Aserciones esperadas:**
  - La aplicación redirige automáticamente a `https://alizia.educabot.ai/asistente` (no se muestra el contenido de "Docentes").
  - La navegación lateral sigue mostrando solo los 4 módulos permitidos para Teacher.
