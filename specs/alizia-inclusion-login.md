# Alizia Inclusion — Login Test Plan

## Application Overview

Alizia es "tu asistente para aulas más inclusivas" (Educabot). La pantalla de login (`https://alizia.educabot.ai/login`) permite a docentes y administradores autenticarse con correo electrónico y contraseña para acceder a la plataforma. Desde ahí también se puede iniciar el flujo de recuperación de contraseña. Tras un login exitoso, ambos roles llegan a `/asistente` (el asistente conversacional), pero el menú de navegación y el contenido difieren según el rol.

## Test Scenarios

### 1. Login

**Seed:** navegar directamente a `https://alizia.educabot.ai/login` (no requiere setup previo).

#### 1.1. campos-vacios

**Precondiciones:** Usuario no autenticado, en `https://alizia.educabot.ai/login`, con los campos "Correo electrónico" y "Contraseña" vacíos.

**Pasos:**
  1. Hacer clic en el botón "Iniciar sesión" sin completar ningún campo.

**Aserciones esperadas:**
  - Se muestra el mensaje "Ingresá tu correo electrónico" debajo del campo de correo electrónico.
  - Se muestra el mensaje "Ingresá tu contraseña." debajo del campo de contraseña.
  - La página permanece en `/login` (no navega).

#### 1.2. email-con-formato-invalido

**Precondiciones:** Usuario no autenticado, en `/login`.

**Pasos:**
  1. Escribir `correo-invalido` (sin `@` ni dominio) en el campo "Correo electrónico".
  2. Dejar el campo "Contraseña" vacío.
  3. Hacer clic en "Iniciar sesión".

**Aserciones esperadas:**
  - Se muestra el mensaje "Ingresá un correo electrónico válido." debajo del campo de correo electrónico.
  - Se sigue mostrando "Ingresá tu contraseña." debajo del campo de contraseña.
  - La página permanece en `/login`.

#### 1.3. mostrar-ocultar-contrasena

**Precondiciones:** Usuario no autenticado, en `/login`, con texto escrito en el campo "Contraseña".

**Pasos:**
  1. Escribir un valor cualquiera en el campo "Contraseña" (el campo es de tipo `password` por defecto).
  2. Hacer clic en el botón "Mostrar contraseña" (ícono junto al campo).

**Aserciones esperadas:**
  - El campo cambia su tipo de `password` a `text`, mostrando la contraseña en texto plano.
  - El botón cambia su nombre accesible de "Mostrar contraseña" a "Ocultar contraseña".

#### 1.4. TC-001 credenciales-incorrectas

**Precondiciones:** Usuario no autenticado, en `/login`.

**Pasos:**
  1. Escribir un correo válido pero no asociado a una cuenta real, o un correo válido con contraseña incorrecta (por ejemplo `admin@alizia.com` / `wrongpassword123`).
  2. Hacer clic en "Iniciar sesión".

**Aserciones esperadas:**
  - Se muestra una alerta general (no atada a un campo específico) con el texto: "El correo electrónico o la contraseña son incorrectos. Revisalos e intentá nuevamente."
  - La página permanece en `/login`, no se autentica al usuario.

#### 1.5. TC-002 olvide-mi-contrasena-navega-a-recuperacion

**Precondiciones:** Usuario no autenticado, en `/login`.

**Pasos:**
  1. Hacer clic en el botón "Olvidé mi contraseña".

**Aserciones esperadas:**
  - Navega a `https://alizia.educabot.ai/recuperar-contrasena`.
  - Se muestra el título "Restablecer contraseña" y el texto "Ingresá tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña".
  - Hay un campo "Correo electrónico", un botón "Enviar enlace" y un botón "Volver a Iniciar sesión".
  - Al hacer clic en "Volver a Iniciar sesión", se regresa a `/login`.

  > Nota: no se probó el envío real del formulario de recuperación (botón "Enviar enlace") para evitar disparar un email real durante la exploración read-only. Queda pendiente de definir en la fase de generación si se debe mockear la petición de red.

#### 1.6. TC-003 login-exitoso-admin

**Precondiciones:** Usuario no autenticado, en `/login`. Cuenta válida con rol Admin: `admin@alizia.com` / `admin123`.

**Pasos:**
  1. Escribir `admin@alizia.com` en "Correo electrónico".
  2. Escribir `admin123` en "Contraseña".
  3. Hacer clic en "Iniciar sesión".

**Aserciones esperadas:**
  - Redirige a `https://alizia.educabot.ai/asistente`.
  - No se muestra ningún mensaje de error.
  - El asistente saluda con "Hola Administrador,".

#### 1.7. TC-004 login-exitoso-teacher

**Precondiciones:** Usuario no autenticado, en `/login`. Cuenta válida con rol Teacher: `teacher2@alizia.com` / `teacher123`.

**Pasos:**
  1. Escribir `teacher2@alizia.com` en "Correo electrónico".
  2. Escribir `teacher123` en "Contraseña".
  3. Hacer clic en "Iniciar sesión".

**Aserciones esperadas:**
  - Redirige a `https://alizia.educabot.ai/asistente`.
  - No se muestra ningún mensaje de error.
  - El asistente saluda con "Hola Carlos," (nombre de pila asociado a la cuenta).
  - Se muestra un modal de bienvenida ("Alizia inclusión") con un video introductorio y un botón "Continuar"; no se observó este modal en el login de Admin en la misma sesión de exploración (posible modal de "primer ingreso" ligado a la cuenta, no al rol — a confirmar).

#### 1.8. TC-005 cerrar-sesion

**Precondiciones:** Usuario autenticado (rol Admin) en `/asistente`.

**Pasos:**
  1. Hacer clic en el botón "Menú de usuario" (avatar con inicial del nombre, esquina superior de la navegación).
  2. Hacer clic en la opción "Cerrar sesión" del menú desplegado.

**Aserciones esperadas:**
  - El menú desplegado muestra el nombre completo ("Administrador Alizia"), el correo (`admin@alizia.com`) y el nombre de la institución ("Alizia Inclusión") antes de cerrar sesión.
  - Tras hacer clic en "Cerrar sesión", redirige de vuelta a `https://alizia.educabot.ai/login`.

### 2. Landing post-login

**Seed:** login exitoso (ver 1.6 / 1.7) como precondición de cada escenario.

#### 2.1. vista-inicial-rol-admin

**Precondiciones:** Login exitoso como Admin (`admin@alizia.com`), en `/asistente`.

**Pasos:**
  1. Observar la barra de navegación lateral y el contenido principal inmediatamente después del login.

**Aserciones esperadas:**
  - La navegación incluye los enlaces: "Alizia asistente" (`/asistente`), "Primeros pasos" (`/primeros-pasos`), "Materiales" (`/materiales`), "Recursos pedagógicos" (`/recursos`), "Aulas" (`/admin/aulas`) y "Docentes" (`/admin/docentes`).
  - El saludo del asistente es "Hola Administrador, ¿Cómo puedo ayudarte?".
  - Se muestran accesos rápidos: "Adaptar una actividad para un alumno", "Tengo una situación difícil en el aula", "Crear un recurso pedagógico", "No sé por donde empezar".
  - El panel lateral "Historial" aparece abierto por defecto, con el texto "Todavía no tenés conversaciones anteriores" (cuenta sin historial previo).

#### 2.2. vista-inicial-rol-teacher

**Precondiciones:** Login exitoso como Teacher (`teacher2@alizia.com`), en `/asistente`.

**Pasos:**
  1. Cerrar el modal de bienvenida ("Continuar"), si aparece.
  2. Observar la barra de navegación lateral y el contenido principal.

**Aserciones esperadas:**
  - La navegación incluye únicamente: "Alizia asistente" (`/asistente`), "Primeros pasos" (`/primeros-pasos`), "Materiales" (`/materiales`) y "Recursos pedagógicos" (`/recursos`) — **sin** los enlaces "Aulas" ni "Docentes" que sí ve el rol Admin.
  - El saludo del asistente es "Hola Carlos, ¿Cómo puedo ayudarte?".
  - Se muestran los mismos accesos rápidos que para Admin ("Adaptar una actividad para un alumno", etc.).
  - Se muestra además una sección "Accesos a tus herramientas" con tarjetas hacia "Primeros pasos", "Materiales" y "Recursos pedagógicos" — sección no observada en la vista de Admin.
