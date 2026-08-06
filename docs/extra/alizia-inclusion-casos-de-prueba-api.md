# Casos de prueba API — Alizia Inclusion

Set básico de casos de prueba (solo camino feliz, sin casos rebuscados) para validar los endpoints de `alizia-inclusion-be` mediante peticiones API directas (curl / Postman / Insomnia), sin pasar por la interfaz.

Fuente: `alizia-inclusion-be-openapi.yaml` (OpenAPI 3.0.3, versión 1.0.0).

## Notas generales

- **Base URL:**
  ```bash
  export BASE_URL="https://alizia-inclusion-production.up.railway.app/api/v1"
  # o local: export BASE_URL="http://localhost:8080/api/v1"
  ```
- **Autenticación:** Bearer JWT. La mayoría de los endpoints requieren header `Authorization: Bearer $TOKEN`. Se obtiene un token de rol **docente** en 1.1 y uno de rol **admin** de forma análoga (mismo endpoint, usuario con rol admin) — en los ejemplos se usa `$TOKEN` para docente y `$ADMIN_TOKEN` para admin.
- **Envelope de respuesta:** casi todas las respuestas 200/201 exitosas vienen envueltas como `{"description": <payload>}`. **Excepción — estas 5 devuelven el payload SIN envolver:** `POST /students`, `POST /students/{id}/notes`, `POST /adaptations`, `POST /adaptations/{id}/notes`, `POST /classrooms`. Los ejemplos de este documento respetan esa diferencia.
- **Alcance:** cada endpoint tiene **un único caso de éxito (2xx)**. No se incluyen casos de error/validación en esta pasada.
- **Orden de ejecución:** dentro de cada módulo, los casos están ordenados para poder correrse en secuencia (crear → leer → actualizar → borrar al final), reutilizando ids devueltos por casos anteriores. Si se re-ejecuta la suite completa, hay que recrear los recursos borrados por los casos `DELETE`.
- Los ids de ejemplo (`classroom_id: 5`, `student_id: 7`, etc.) son ilustrativos; reemplazar por los que devuelva realmente el ambiente al ejecutar.

---

## 1. Auth (7)

### 1.1 — POST /auth/login
- **Descripción:** Login con credenciales válidas.
- **Auth requerida:** No
- **Precondición:** Usuario docente existente y activo.
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "docente@ejemplo.com", "password": "Password123"}'
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "8f2b1c...",
      "user": {
        "id": 2,
        "name": "Docente Ejemplo",
        "organization_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "org_name": "Escuela Ejemplo",
        "email": "docente@ejemplo.com",
        "role": "teacher",
        "roles": ["teacher"],
        "active": true
      }
    }
  }
  ```

### 1.2 — POST /auth/register
- **Descripción:** Registro autoservicio (solo funciona si `SELF_REGISTRATION_ENABLED=true` en el ambiente).
- **Auth requerida:** No
- **Precondición:** Feature flag de autoregistro habilitado; `organization_id` válido.
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "nuevo.docente@ejemplo.com",
      "password": "Password123",
      "name": "Nuevo Docente",
      "organization_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    }'
  ```
- **Response esperado (201):**
  ```json
  {
    "description": {
      "access_token": "eyJhbGciOiJSUzI1NiIs...",
      "refresh_token": "a1c9f0...",
      "user": {
        "id": 15,
        "name": "Nuevo Docente",
        "organization_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "org_name": "Escuela Ejemplo",
        "email": "nuevo.docente@ejemplo.com",
        "role": "teacher",
        "roles": ["teacher"],
        "active": true
      }
    }
  }
  ```

### 1.3 — POST /auth/refresh
- **Descripción:** Renovar access token con un refresh token vigente.
- **Auth requerida:** No (usa `refresh_token` en el body)
- **Precondición:** `refresh_token` válido, obtenido en 1.1.
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/auth/refresh" \
    -H "Content-Type: application/json" \
    -d '{"refresh_token": "8f2b1c..."}'
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "access_token": "eyJhbGciOiJSUzI1NiIs...(nuevo)",
      "refresh_token": "b7e4d2...(nuevo)"
    }
  }
  ```

### 1.4 — POST /auth/password-reset
- **Descripción:** Solicitar reseteo de contraseña.
- **Auth requerida:** No
- **Precondición:** Ninguna (siempre responde 204, exista o no el email).
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/auth/password-reset" \
    -H "Content-Type: application/json" \
    -d '{"email": "docente@ejemplo.com"}'
  ```
- **Response esperado (204):** Sin body.

### 1.5 — POST /auth/password-reset/confirm
- **Descripción:** Confirmar reseteo de contraseña con el token recibido por email.
- **Auth requerida:** No
- **Precondición:** Token de reseteo válido (generado por 1.4, obtenido del email/backoffice).
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/auth/password-reset/confirm" \
    -H "Content-Type: application/json" \
    -d '{"token": "reset-token-valido", "new_password": "NuevaPassword123"}'
  ```
- **Response esperado (204):** Sin body.

### 1.6 — GET /auth/me
- **Descripción:** Obtener el usuario autenticado actual.
- **Auth requerida:** Sí
- **Precondición:** Token válido (de 1.1).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/auth/me" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "id": 2,
      "name": "Docente Ejemplo",
      "organization_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "org_name": "Escuela Ejemplo",
      "email": "docente@ejemplo.com",
      "role": "teacher",
      "roles": ["teacher"],
      "active": true
    }
  }
  ```

### 1.7 — POST /auth/logout
- **Descripción:** Logout (revoca todos los refresh tokens del usuario).
- **Auth requerida:** Sí
- **Precondición:** Token válido.
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/auth/logout" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (204):** Sin body.

---

## 2. Admin (7)

### 2.1 — POST /admin/users
- **Descripción:** Crear usuario (admin-only, queda en la organización del admin).
- **Auth requerida:** Sí (rol admin)
- **Precondición:** `role` debe existir en el catálogo de roles activos (ver 2.7).
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/admin/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"email": "usuario.nuevo@ejemplo.com", "name": "Usuario Nuevo", "password": "Password123", "role": "teacher"}'
  ```
- **Response esperado (201):**
  ```json
  {
    "description": {
      "id": 10,
      "name": "Usuario Nuevo",
      "organization_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "org_name": "Escuela Ejemplo",
      "email": "usuario.nuevo@ejemplo.com",
      "role": "teacher",
      "roles": ["teacher"],
      "active": true
    }
  }
  ```

### 2.2 — GET /admin/users
- **Descripción:** Listar todos los usuarios de la organización (sin paginación).
- **Auth requerida:** Sí (rol admin)
- **Precondición:** Al menos un usuario existente (ver 2.1).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/admin/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": [
      { "id": 10, "name": "Usuario Nuevo", "organization_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "org_name": "Escuela Ejemplo", "email": "usuario.nuevo@ejemplo.com", "role": "teacher", "roles": ["teacher"], "active": true }
    ]
  }
  ```

### 2.3 — POST /admin/users/invite
- **Descripción:** Invitar usuario por email (magic link, sin password).
- **Auth requerida:** Sí (rol admin)
- **Precondición:** Email no debe pertenecer a una cuenta ya activa.
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/admin/users/invite" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"email": "invitado@ejemplo.com", "name": "Invitado Ejemplo", "role": "teacher"}'
  ```
- **Response esperado (201):**
  ```json
  {
    "description": {
      "id": 11,
      "name": "Invitado Ejemplo",
      "organization_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "org_name": "Escuela Ejemplo",
      "email": "invitado@ejemplo.com",
      "role": "teacher",
      "roles": ["teacher"],
      "active": false
    }
  }
  ```

### 2.4 — PATCH /admin/users/{id}
- **Descripción:** Cambiar el email de un usuario (queda "pending" y se reenvía magic link).
- **Auth requerida:** Sí (rol admin)
- **Precondición:** `id` de usuario existente (de 2.1).
- **Request:**
  ```bash
  curl -X PATCH "$BASE_URL/admin/users/10" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"email": "usuario.nuevo.email@ejemplo.com"}'
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "id": 10,
      "name": "Usuario Nuevo",
      "organization_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "org_name": "Escuela Ejemplo",
      "email": "usuario.nuevo.email@ejemplo.com",
      "role": "teacher",
      "roles": ["teacher"],
      "active": false
    }
  }
  ```

### 2.5 — DELETE /admin/users/{id}
- **Descripción:** Dar de baja usuario (soft-delete + revoca sesiones).
- **Auth requerida:** Sí (rol admin)
- **Precondición:** `id` de usuario existente, distinto del admin logueado.
- **Request:**
  ```bash
  curl -X DELETE "$BASE_URL/admin/users/10" \
    -H "Authorization: Bearer $ADMIN_TOKEN"
  ```
- **Response esperado (204):** Sin body.

### 2.6 — POST /admin/users/{id}/reactivate
- **Descripción:** Reactivar un usuario previamente dado de baja.
- **Auth requerida:** Sí (rol admin)
- **Precondición:** `id` de usuario dado de baja (de 2.5).
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/admin/users/10/reactivate" \
    -H "Authorization: Bearer $ADMIN_TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "id": 10,
      "name": "Usuario Nuevo",
      "organization_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "org_name": "Escuela Ejemplo",
      "email": "usuario.nuevo.email@ejemplo.com",
      "role": "teacher",
      "roles": ["teacher"],
      "active": true
    }
  }
  ```

### 2.7 — GET /roles
- **Descripción:** Listar roles activos de la organización.
- **Auth requerida:** Sí (rol admin)
- **Precondición:** Ninguna.
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/roles" \
    -H "Authorization: Bearer $ADMIN_TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": [
      { "name": "admin", "label": "Administrador" },
      { "name": "teacher", "label": "Docente" },
      { "name": "coordinator", "label": "Coordinador" }
    ]
  }
  ```

---

## 3. Management (7)

### 3.1 — GET /classrooms
- **Descripción:** Listar aulas de la organización.
- **Auth requerida:** Sí
- **Precondición:** Ninguna.
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/classrooms" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": [
      { "id": 5, "name": "3ro B", "grade": "3ro", "section": "B", "student_count": 20 }
    ]
  }
  ```

### 3.2 — POST /classrooms
- **Descripción:** Crear aula.
- **Auth requerida:** Sí
- **Precondición:** Ninguna.
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/classrooms" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name": "3ro B", "grade": "3ro", "section": "B"}'
  ```
- **Response esperado (201, body SIN envolver):**
  ```json
  { "id": 5, "name": "3ro B", "grade": "3ro", "section": "B", "student_count": 0 }
  ```

### 3.3 — GET /classrooms/{id}
- **Descripción:** Obtener aula.
- **Auth requerida:** Sí
- **Precondición:** `id` de aula existente (de 3.2).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/classrooms/5" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  { "description": { "id": 5, "name": "3ro B", "grade": "3ro", "section": "B", "student_count": 0 } }
  ```

### 3.4 — PUT /classrooms/{id}
- **Descripción:** Actualizar aula (solo pisa campos no-nil).
- **Auth requerida:** Sí
- **Precondición:** `id` de aula existente.
- **Request:**
  ```bash
  curl -X PUT "$BASE_URL/classrooms/5" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"section": "C"}'
  ```
- **Response esperado (200):**
  ```json
  { "description": { "id": 5, "name": "3ro B", "grade": "3ro", "section": "C", "student_count": 0 } }
  ```

### 3.5 — GET /classrooms/{id}/students
- **Descripción:** Listar alumnos de un aula.
- **Auth requerida:** Sí
- **Precondición:** `id` de aula existente; idealmente con algún alumno asignado (ver 4.2).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/classrooms/5/students" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": [
      { "id": 7, "name": "Alumno Ejemplo", "classroom_id": 5, "profile": null, "created_at": "2026-08-01T10:00:00Z" }
    ]
  }
  ```

### 3.6 — GET /teachers
- **Descripción:** Listar docentes de la organización.
- **Auth requerida:** Sí
- **Precondición:** Ninguna.
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/teachers" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": [
      { "id": 2, "name": "Docente Ejemplo", "organization_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "org_name": "Escuela Ejemplo", "email": "docente@ejemplo.com", "role": "teacher", "roles": ["teacher"], "active": true }
    ]
  }
  ```

### 3.7 — DELETE /classrooms/{id}
- **Descripción:** Borrar aula.
- **Auth requerida:** Sí
- **Precondición:** `id` de aula existente y sin dependencias bloqueantes.
- **Request:**
  ```bash
  curl -X DELETE "$BASE_URL/classrooms/5" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (204):** Sin body.

---

## 4. Students (11)

### 4.1 — GET /students
- **Descripción:** Listar alumnos (docentes ven solo su "mundo"; roles de gestión ven toda la org).
- **Auth requerida:** Sí
- **Precondición:** Ninguna.
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/students" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": [
      { "id": 7, "name": "Alumno Ejemplo", "classroom_id": 5, "profile": null, "created_at": "2026-08-01T10:00:00Z" }
    ]
  }
  ```

### 4.2 — POST /students
- **Descripción:** Crear alumno (si lo crea un docente, se auto-relaciona a su "mundo").
- **Auth requerida:** Sí
- **Precondición:** `classroom_id` existente si se envía (de 3.2).
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/students" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name": "Alumno Ejemplo", "classroom_id": 5}'
  ```
- **Response esperado (201, body SIN envolver):**
  ```json
  { "id": 7, "name": "Alumno Ejemplo", "classroom_id": 5, "profile": null, "created_at": "2026-08-01T10:00:00Z" }
  ```

### 4.3 — GET /students/{id}
- **Descripción:** Obtener alumno (con perfil embebido si existe).
- **Auth requerida:** Sí
- **Precondición:** `id` de alumno existente (de 4.2).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/students/7" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  { "description": { "id": 7, "name": "Alumno Ejemplo", "classroom_id": 5, "profile": null, "created_at": "2026-08-01T10:00:00Z" } }
  ```

### 4.4 — PUT /students/{id}
- **Descripción:** Actualizar alumno (campos opcionales, solo pisa lo no-nil).
- **Auth requerida:** Sí
- **Precondición:** `id` de alumno existente.
- **Request:**
  ```bash
  curl -X PUT "$BASE_URL/students/7" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name": "Alumno Ejemplo Actualizado"}'
  ```
- **Response esperado (200):**
  ```json
  { "description": { "id": 7, "name": "Alumno Ejemplo Actualizado", "classroom_id": 5, "profile": null, "created_at": "2026-08-01T10:00:00Z" } }
  ```

### 4.5 — GET /students/{id}/profile
- **Descripción:** Obtener perfil de alumno (devuelve el `StudentWithProfileResponse` completo).
- **Auth requerida:** Sí
- **Precondición:** `id` de alumno existente.
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/students/7/profile" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  { "description": { "id": 7, "name": "Alumno Ejemplo Actualizado", "classroom_id": 5, "profile": null, "created_at": "2026-08-01T10:00:00Z" } }
  ```

### 4.6 — PUT /students/{id}/profile
- **Descripción:** Crear/actualizar (upsert) perfil pedagógico del alumno (siempre responde 200, incluso en el insert inicial).
- **Auth requerida:** Sí
- **Precondición:** `id` de alumno existente.
- **Request:**
  ```bash
  curl -X PUT "$BASE_URL/students/7/profile" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"is_transitory": false, "difficulties": ["atencion"], "free_description": "Se distrae con facilidad."}'
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "id": 7,
      "name": "Alumno Ejemplo Actualizado",
      "classroom_id": 5,
      "profile": {
        "id": 3,
        "student_id": 7,
        "student_name": "Alumno Ejemplo Actualizado",
        "is_transitory": false,
        "difficulties": ["atencion"],
        "free_description": "Se distrae con facilidad."
      },
      "created_at": "2026-08-01T10:00:00Z"
    }
  }
  ```

### 4.7 — GET /students/{id}/notes
- **Descripción:** Listar notas del alumno (scopeado: cada docente ve solo sus propias notas).
- **Auth requerida:** Sí
- **Precondición:** `id` de alumno existente; idealmente con una nota creada (ver 4.8).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/students/7/notes" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": [
      { "id": 3, "student_id": 7, "content": "Mejoró la participación en clase.", "type": "seguimiento", "internal": true, "created_at": "2026-08-02T09:00:00Z" }
    ]
  }
  ```

### 4.8 — POST /students/{id}/notes
- **Descripción:** Crear nota de alumno (privada del docente que la crea).
- **Auth requerida:** Sí
- **Precondición:** `id` de alumno existente.
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/students/7/notes" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"content": "Mejoró la participación en clase.", "type": "seguimiento", "internal": true}'
  ```
- **Response esperado (201, body SIN envolver):**
  ```json
  { "id": 3, "student_id": 7, "content": "Mejoró la participación en clase.", "type": "seguimiento", "internal": true, "created_at": "2026-08-02T09:00:00Z" }
  ```

### 4.9 — PUT /students/{id}/notes/{noteId}
- **Descripción:** Editar nota (scopeada por org+student+usuario dueño).
- **Auth requerida:** Sí
- **Precondición:** `noteId` existente y perteneciente al usuario logueado (de 4.8).
- **Request:**
  ```bash
  curl -X PUT "$BASE_URL/students/7/notes/3" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"content": "Mejoró notablemente la participación en clase."}'
  ```
- **Response esperado (200):**
  ```json
  { "description": { "id": 3, "student_id": 7, "content": "Mejoró notablemente la participación en clase.", "type": "seguimiento", "internal": true, "created_at": "2026-08-02T09:00:00Z" } }
  ```

### 4.10 — DELETE /students/{id}/notes/{noteId}
- **Descripción:** Borrar nota (mismo scope que editar).
- **Auth requerida:** Sí
- **Precondición:** `noteId` existente y del usuario logueado.
- **Request:**
  ```bash
  curl -X DELETE "$BASE_URL/students/7/notes/3" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (204):** Sin body.

### 4.11 — DELETE /students/{id}
- **Descripción:** Borrar alumno (hard delete).
- **Auth requerida:** Sí
- **Precondición:** `id` de alumno existente y sin conversaciones asociadas.
- **Request:**
  ```bash
  curl -X DELETE "$BASE_URL/students/7" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (204):** Sin body.

---

## 5. Catalog (4)

### 5.1 — GET /ramps
- **Descripción:** Listar rampas (categorías), con sus devices embebidos.
- **Auth requerida:** Sí
- **Precondición:** Ninguna (catálogo precargado).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/ramps" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": [
      {
        "id": 1,
        "name": "Comunicación",
        "description": "Rampa de comunicación aumentativa",
        "short_description": "Comunicación",
        "video_url": null,
        "sort_order": 1,
        "devices": [
          { "id": 4, "ramp_id": 1, "name": "Tablero de comunicación", "description": "...", "image_url": null, "qr_code": null, "how_to_use": null, "recommendations": null, "rationale": null, "classroom_benefit": null, "needs_description": null, "useful_when": null, "evaluation_criteria": null, "video_transcript": null, "is_therapeutic": false, "quantity": 1, "sort_order": 1, "ramp_name": "Comunicación", "downloads": [], "videos": [] }
        ]
      }
    ]
  }
  ```

### 5.2 — GET /ramps/{id}
- **Descripción:** Obtener rampa.
- **Auth requerida:** Sí
- **Precondición:** `id` de rampa existente (de 5.1).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/ramps/1" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "id": 1, "name": "Comunicación", "description": "Rampa de comunicación aumentativa",
      "short_description": "Comunicación", "video_url": null, "sort_order": 1,
      "devices": [ { "id": 4, "ramp_id": 1, "name": "Tablero de comunicación", "description": "...", "image_url": null, "qr_code": null, "how_to_use": null, "recommendations": null, "rationale": null, "classroom_benefit": null, "needs_description": null, "useful_when": null, "evaluation_criteria": null, "video_transcript": null, "is_therapeutic": false, "quantity": 1, "sort_order": 1, "ramp_name": "Comunicación", "downloads": [], "videos": [] } ]
    }
  }
  ```

### 5.3 — GET /devices
- **Descripción:** Listar dispositivos activos (`is_active=true`, no configurable vía API).
- **Auth requerida:** Sí
- **Precondición:** Ninguna. Opcionalmente filtrar por `ramp_id`.
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/devices?ramp_id=1" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": [
      { "id": 4, "ramp_id": 1, "name": "Tablero de comunicación", "description": "...", "image_url": null, "qr_code": null, "how_to_use": null, "recommendations": null, "rationale": null, "classroom_benefit": null, "needs_description": null, "useful_when": null, "evaluation_criteria": null, "video_transcript": null, "is_therapeutic": false, "quantity": 1, "sort_order": 1, "ramp_name": "Comunicación", "downloads": [], "videos": [] }
    ]
  }
  ```

### 5.4 — GET /devices/{id}
- **Descripción:** Obtener dispositivo (no filtra por `is_active`).
- **Auth requerida:** Sí
- **Precondición:** `id` de dispositivo existente (de 5.3).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/devices/4" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": { "id": 4, "ramp_id": 1, "name": "Tablero de comunicación", "description": "...", "image_url": null, "qr_code": null, "how_to_use": null, "recommendations": null, "rationale": null, "classroom_benefit": null, "needs_description": null, "useful_when": null, "evaluation_criteria": null, "video_transcript": null, "is_therapeutic": false, "quantity": 1, "sort_order": 1, "ramp_name": "Comunicación", "downloads": [], "videos": [] }
  }
  ```

---

## 6. Adaptations (7)

### 6.1 — GET /adaptations
- **Descripción:** Listar recursos pedagógicos (docentes ven lo propio; roles de gestión ven todos).
- **Auth requerida:** Sí
- **Precondición:** Ninguna. Filtros opcionales `student_id`, `range`.
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/adaptations" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": [
      { "id": 12, "student_id": 7, "student_name": "Alumno Ejemplo", "teacher_id": 2, "teacher_name": "Docente Ejemplo", "device_id": 4, "device_name": "Tablero de comunicación", "device_ids": [4], "device_names": ["Tablero de comunicación"], "title": "Actividad adaptada de lectura", "subject": "Lengua", "activity_description": "Lectura guiada con apoyo visual.", "adaptation_strategy": "Uso de pictogramas.", "adaptation_type": "actividad_adaptada", "outcome": null, "notes": null, "status": "en_curso", "steps": [{ "orden": 1, "texto": "Presentar el texto con pictogramas.", "checkbox": false }], "ramp_id": 1, "source_conversation_id": null, "source_message_id": null, "created_at": "2026-08-02T11:00:00Z", "updated_at": "2026-08-02T11:00:00Z" }
    ]
  }
  ```

### 6.2 — POST /adaptations
- **Descripción:** Crear recurso pedagógico (status inicial siempre `en_curso`).
- **Auth requerida:** Sí
- **Precondición:** `student_id` (de 4.2), `device_id` (de 5.3) y `ramp_id` (de 5.1) existentes si se envían.
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/adaptations" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "student_id": 7,
      "device_id": 4,
      "title": "Actividad adaptada de lectura",
      "subject": "Lengua",
      "activity_description": "Lectura guiada con apoyo visual.",
      "adaptation_strategy": "Uso de pictogramas.",
      "adaptation_type": "actividad_adaptada",
      "ramp_id": 1
    }'
  ```
- **Response esperado (201, body SIN envolver):**
  ```json
  { "id": 12, "student_id": 7, "student_name": "Alumno Ejemplo", "teacher_id": 2, "teacher_name": "Docente Ejemplo", "device_id": 4, "device_name": "Tablero de comunicación", "device_ids": [4], "device_names": ["Tablero de comunicación"], "title": "Actividad adaptada de lectura", "subject": "Lengua", "activity_description": "Lectura guiada con apoyo visual.", "adaptation_strategy": "Uso de pictogramas.", "adaptation_type": "actividad_adaptada", "outcome": null, "notes": null, "status": "en_curso", "steps": [], "ramp_id": 1, "source_conversation_id": null, "source_message_id": null, "created_at": "2026-08-02T11:00:00Z", "updated_at": "2026-08-02T11:00:00Z" }
  ```

### 6.3 — GET /adaptations/{id}
- **Descripción:** Obtener recurso pedagógico.
- **Auth requerida:** Sí
- **Precondición:** `id` existente (de 6.2).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/adaptations/12" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  { "description": { "id": 12, "student_id": 7, "student_name": "Alumno Ejemplo", "teacher_id": 2, "teacher_name": "Docente Ejemplo", "device_id": 4, "device_name": "Tablero de comunicación", "device_ids": [4], "device_names": ["Tablero de comunicación"], "title": "Actividad adaptada de lectura", "subject": "Lengua", "activity_description": "Lectura guiada con apoyo visual.", "adaptation_strategy": "Uso de pictogramas.", "adaptation_type": "actividad_adaptada", "outcome": null, "notes": null, "status": "en_curso", "steps": [], "ramp_id": 1, "source_conversation_id": null, "source_message_id": null, "created_at": "2026-08-02T11:00:00Z", "updated_at": "2026-08-02T11:00:00Z" } }
  ```

### 6.4 — PUT /adaptations/{id}
- **Descripción:** Actualizar recurso pedagógico (patch parcial, campos opcionales; recurso completo recargado tras el update).
- **Auth requerida:** Sí
- **Precondición:** `id` existente.
- **Request:**
  ```bash
  curl -X PUT "$BASE_URL/adaptations/12" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status": "probado", "outcome": "El alumno logró seguir la lectura completa."}'
  ```
- **Response esperado (200):**
  ```json
  { "description": { "id": 12, "student_id": 7, "student_name": "Alumno Ejemplo", "teacher_id": 2, "teacher_name": "Docente Ejemplo", "device_id": 4, "device_name": "Tablero de comunicación", "device_ids": [4], "device_names": ["Tablero de comunicación"], "title": "Actividad adaptada de lectura", "subject": "Lengua", "activity_description": "Lectura guiada con apoyo visual.", "adaptation_strategy": "Uso de pictogramas.", "adaptation_type": "actividad_adaptada", "outcome": "El alumno logró seguir la lectura completa.", "notes": null, "status": "probado", "steps": [], "ramp_id": 1, "source_conversation_id": null, "source_message_id": null, "created_at": "2026-08-02T11:00:00Z", "updated_at": "2026-08-02T11:05:00Z" } }
  ```

### 6.5 — GET /adaptations/{id}/resources
- **Descripción:** Listar adjuntos del recurso.
- **Auth requerida:** Sí
- **Precondición:** `id` existente (los adjuntos suelen cargarse por otro proceso; puede devolver lista vacía).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/adaptations/12/resources" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": [
      { "id": 1, "adaptation_id": 12, "title": "Guía de pictogramas", "file_url": "https://cdn.ejemplo.com/guia.pdf", "file_type": "pdf", "created_at": "2026-08-02T11:10:00Z" }
    ]
  }
  ```

### 6.6 — GET /adaptations/{id}/export
- **Descripción:** Exportar recurso como PDF o Markdown (binario).
- **Auth requerida:** Sí
- **Precondición:** `id` existente.
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/adaptations/12/export?format=pdf&disposition=attachment" \
    -H "Authorization: Bearer $TOKEN" \
    -o adaptacion-12.pdf
  ```
- **Response esperado (200):** Documento binario (`Content-Type: application/pdf`), guardado en `adaptacion-12.pdf`.

### 6.7 — DELETE /adaptations/{id}
- **Descripción:** Borrar recurso pedagógico.
- **Auth requerida:** Sí
- **Precondición:** `id` existente.
- **Request:**
  ```bash
  curl -X DELETE "$BASE_URL/adaptations/12" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (204):** Sin body.

---

## 7. AdaptationNotes (4)

### 7.1 — GET /adaptations/{id}/notes
- **Descripción:** Listar notas del recurso (independientes de `/students/{id}/notes`; filtradas por usuario).
- **Auth requerida:** Sí
- **Precondición:** `id` de recurso existente (de 6.2); idealmente con una nota creada (ver 7.2).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/adaptations/12/notes" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": [
      { "id": 2, "adaptation_id": 12, "content": "Funcionó bien con apoyo visual adicional.", "created_at": "2026-08-02T11:20:00Z", "updated_at": "2026-08-02T11:20:00Z" }
    ]
  }
  ```

### 7.2 — POST /adaptations/{id}/notes
- **Descripción:** Crear nota de recurso.
- **Auth requerida:** Sí
- **Precondición:** `id` de recurso existente.
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/adaptations/12/notes" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"content": "Funcionó bien con apoyo visual adicional."}'
  ```
- **Response esperado (201, body SIN envolver):**
  ```json
  { "id": 2, "adaptation_id": 12, "content": "Funcionó bien con apoyo visual adicional.", "created_at": "2026-08-02T11:20:00Z", "updated_at": "2026-08-02T11:20:00Z" }
  ```

### 7.3 — PUT /adaptations/{id}/notes/{noteId}
- **Descripción:** Editar nota de recurso (scopeada por org+adaptation+usuario dueño).
- **Auth requerida:** Sí
- **Precondición:** `noteId` existente y del usuario logueado (de 7.2).
- **Request:**
  ```bash
  curl -X PUT "$BASE_URL/adaptations/12/notes/2" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"content": "Funcionó muy bien con apoyo visual adicional y refuerzo verbal."}'
  ```
- **Response esperado (200):**
  ```json
  { "description": { "id": 2, "adaptation_id": 12, "content": "Funcionó muy bien con apoyo visual adicional y refuerzo verbal.", "created_at": "2026-08-02T11:20:00Z", "updated_at": "2026-08-02T11:25:00Z" } }
  ```

### 7.4 — DELETE /adaptations/{id}/notes/{noteId}
- **Descripción:** Borrar nota de recurso (mismo scope que editar).
- **Auth requerida:** Sí
- **Precondición:** `noteId` existente y del usuario logueado.
- **Request:**
  ```bash
  curl -X DELETE "$BASE_URL/adaptations/12/notes/2" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (204):** Sin body.

---

## 8. Chat (4)

### 8.1 — GET /chat/history/{contextId}
- **Descripción:** Historial de conversaciones. `contextId` es en realidad el "mode"/dimensión (`alumno`, `valija`, `tema`).
- **Auth requerida:** Sí
- **Precondición:** Al menos una conversación existente en esa dimensión (generada vía 11.6).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/chat/history/alumno" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": [
      { "id": 55, "mode": "alumno", "messages": [ { "id": 101, "role": "user", "content": "¿Cómo puedo adaptar la actividad de lectura para Juan?", "created_at": "2026-08-02T12:00:00Z" }, { "id": 102, "role": "assistant", "content": "Te propongo usar pictogramas de apoyo...", "created_at": "2026-08-02T12:00:05Z" } ], "created_at": "2026-08-02T12:00:00Z" }
    ]
  }
  ```

### 8.2 — GET /chat/conversation/{id}
- **Descripción:** Obtener conversación completa (usado para reabrir el historial).
- **Auth requerida:** Sí
- **Precondición:** `id` de conversación existente (de 8.1 / 11.6).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/chat/conversation/55" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": { "id": 55, "mode": "alumno", "messages": [ { "id": 101, "role": "user", "content": "¿Cómo puedo adaptar la actividad de lectura para Juan?", "created_at": "2026-08-02T12:00:00Z" }, { "id": 102, "role": "assistant", "content": "Te propongo usar pictogramas de apoyo...", "created_at": "2026-08-02T12:00:05Z" } ], "created_at": "2026-08-02T12:00:00Z" }
  }
  ```

### 8.3 — PATCH /chat/conversation/{id}
- **Descripción:** Renombrar conversación.
- **Auth requerida:** Sí
- **Precondición:** `id` de conversación existente.
- **Request:**
  ```bash
  curl -X PATCH "$BASE_URL/chat/conversation/55" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title": "Adaptación de lectura - Juan"}'
  ```
- **Response esperado (204):** Sin body.

### 8.4 — DELETE /chat/conversation/{id}
- **Descripción:** Borrar conversación.
- **Auth requerida:** Sí
- **Precondición:** `id` de conversación existente.
- **Request:**
  ```bash
  curl -X DELETE "$BASE_URL/chat/conversation/55" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (204):** Sin body.

---

## 9. Feedback (3)

### 9.1 — POST /chat/messages/{messageId}/feedback
- **Descripción:** Dejar feedback (like/dislike) sobre un mensaje del asistente (upsert; mismo status si crea o actualiza).
- **Auth requerida:** Sí
- **Precondición:** `messageId` de un mensaje del asistente existente (de 8.1/11.6, ej. `id: 102`).
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/chat/messages/102/feedback" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"rating": "like", "comment": "Muy útil la sugerencia."}'
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "id": 1,
      "conversation_message_id": 102,
      "conversation_id": 55,
      "rating": "like",
      "comment": "Muy útil la sugerencia.",
      "created_at": "2026-08-02T12:05:00Z",
      "updated_at": "2026-08-02T12:05:00Z"
    }
  }
  ```

### 9.2 — GET /chat/feedback
- **Descripción:** Listar feedback de mensajes (revisión interna, sin paginación).
- **Auth requerida:** Sí
- **Precondición:** Al menos un feedback cargado (de 9.1).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/chat/feedback?rating=like" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": [
      { "id": 1, "conversation_message_id": 102, "conversation_id": 55, "rating": "like", "comment": "Muy útil la sugerencia.", "created_at": "2026-08-02T12:05:00Z", "updated_at": "2026-08-02T12:05:00Z", "user_id": 2, "message_content": "Te propongo usar pictogramas de apoyo...", "previous_user_message": "¿Cómo puedo adaptar la actividad de lectura para Juan?" }
    ]
  }
  ```

### 9.3 — DELETE /chat/messages/{messageId}/feedback
- **Descripción:** Borrar el feedback propio sobre un mensaje.
- **Auth requerida:** Sí
- **Precondición:** Feedback existente del usuario logueado sobre ese mensaje (de 9.1).
- **Request:**
  ```bash
  curl -X DELETE "$BASE_URL/chat/messages/102/feedback" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (204):** Sin body.

---

## 10. Dashboard (2)

### 10.1 — GET /dashboard/metrics
- **Descripción:** Métricas agregadas de la organización.
- **Auth requerida:** Sí
- **Precondición:** Ninguna (funciona incluso con datos en cero).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/dashboard/metrics" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "total_students": 1,
      "students_with_profiles": 1,
      "total_adaptations": 1,
      "adaptations_by_status": { "en_curso": 1 },
      "adaptations_by_type": { "actividad_adaptada": 1 },
      "top_used_devices": [ { "device_id": 4, "device_name": "Tablero de comunicación", "count": 1 } ],
      "adaptations_this_week": 1,
      "classroom_count": 1
    }
  }
  ```

### 10.2 — GET /dashboard/ai-usage
- **Descripción:** Uso de IA (tokens/requests) de la organización.
- **Auth requerida:** Sí
- **Precondición:** Ninguna. `days` opcional (default 30, máximo 365).
- **Request:**
  ```bash
  curl -X GET "$BASE_URL/dashboard/ai-usage?days=30" \
    -H "Authorization: Bearer $TOKEN"
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "window_days": 30,
      "total_requests": 2,
      "prompt_tokens": 1200,
      "completion_tokens": 400,
      "total_tokens": 1600,
      "by_mode": [
        { "mode": "assist", "requests": 1, "prompt_tokens": 700, "completion_tokens": 250, "total_tokens": 950 },
        { "mode": "recommend", "requests": 1, "prompt_tokens": 500, "completion_tokens": 150, "total_tokens": 650 }
      ]
    }
  }
  ```

---

## 11. InclusionAI (6)

### 11.1 — POST /inclusion/open
- **Descripción:** Apertura de sesión / router ("Prompt 0"), sin LLM. El flujo de "faltan datos" se resuelve con 200 + `needs_dimension=true`, nunca error.
- **Auth requerida:** Sí
- **Precondición:** Ninguna.
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/inclusion/open" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"dimension": "alumno", "student_id": 7}'
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "greeting": "Hola, ¿en qué te puedo ayudar hoy con Alumno Ejemplo?",
      "needs_dimension": false,
      "dimension": "alumno",
      "student": { "id": 7, "organization_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "classroom_id": 5, "name": "Alumno Ejemplo", "birthdate": null, "age_range": null, "grade_level": null, "preferred_name": null, "profile": null, "provisional": false, "merged_into_id": null, "created_at": "2026-08-01T10:00:00Z", "updated_at": "2026-08-01T10:00:00Z" },
      "prior_summaries": []
    }
  }
  ```

### 11.2 — POST /inclusion/context
- **Descripción:** Context Assembler (HU-2), sin LLM. Expone el contexto armado antes de llamar al modelo (debug/QA).
- **Auth requerida:** Sí
- **Precondición:** Ninguna (idealmente con `student_id` existente para ver `target_student` poblado).
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/inclusion/context" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"dimension": "alumno", "student_id": 7}'
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "device_catalog": [],
      "situations": [],
      "dimension": "alumno",
      "teacher": null,
      "classroom": null,
      "classroom_students": null,
      "target_student": { "id": 7, "organization_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "classroom_id": 5, "name": "Alumno Ejemplo", "birthdate": null, "age_range": null, "grade_level": null, "preferred_name": null, "profile": null, "provisional": false, "merged_into_id": null, "created_at": "2026-08-01T10:00:00Z", "updated_at": "2026-08-01T10:00:00Z" },
      "diagnoses": null,
      "ppi": null,
      "past_adaptations": [],
      "prior_summaries": [],
      "missing_data": []
    }
  }
  ```

### 11.3 — POST /inclusion/search-content
- **Descripción:** RAG keyword/full-text sobre contenido pedagógico, sin LLM.
- **Auth requerida:** Sí
- **Precondición:** Ninguna (corpus de contenido pedagógico precargado).
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/inclusion/search-content" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"query": "adaptaciones lectura", "limit": 5}'
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "query": "adaptaciones lectura",
      "results": [
        { "content_id": 20, "chunk_id": 100, "title": "Guía de adaptaciones de lectura", "type": "guia", "keywords": ["lectura", "adaptacion"], "preview": "Estrategias para adaptar textos...", "score": 0.87 }
      ]
    }
  }
  ```

### 11.4 — POST /inclusion/search-content/hybrid
- **Descripción:** Búsqueda híbrida (vector + FTS + conceptos) sobre el corpus `rag_*`. Global, no filtrado por organización.
- **Auth requerida:** Sí
- **Precondición:** Ninguna.
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/inclusion/search-content/hybrid" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"semantic_question": "¿Cómo adaptar una actividad de lectura para un alumno con dificultades de atención?", "limit": 5}'
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "question": "¿Cómo adaptar una actividad de lectura para un alumno con dificultades de atención?",
      "results": [
        { "chunk_id": 100, "resource_id": 20, "title": "Guía de adaptaciones de lectura", "chunk_index": 0, "page_start": 1, "page_end": 2, "score": 0.91, "sources": "guia-adaptaciones-lectura.pdf", "summary": "Estrategias de apoyo visual y pictogramas.", "concepts": ["atencion", "lectura"], "content": "Para alumnos con dificultades de atención se recomienda..." }
      ]
    }
  }
  ```

### 11.5 — POST /inclusion/recommend
- **Descripción:** Recomendación de dispositivo/valija vía LLM (sin tools agénticas). Rate-limited por organización.
- **Auth requerida:** Sí
- **Precondición:** `student_id` existente (de 4.2).
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/inclusion/recommend" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"conversation_id": 0, "student_id": 7, "subject": "Lengua", "objective": "Comprensión lectora"}'
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "response": "Te recomiendo usar el Tablero de comunicación para apoyar la lectura guiada...",
      "conversation_id": 56,
      "device_id": 4,
      "adaptation": null
    }
  }
  ```

### 11.6 — POST /inclusion/assist
- **Descripción:** Asistente conversacional principal ("Alizia"). Puede correr loop agéntico, auto-persistir un recurso pedagógico y devolver preguntas estructuradas. Rate-limited por organización.
- **Auth requerida:** Sí
- **Precondición:** Ninguna estricta; `student_id` existente si se quiere foco en un alumno puntual (de 4.2).
- **Request:**
  ```bash
  curl -X POST "$BASE_URL/inclusion/assist" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"conversation_id": 0, "student_id": 7, "message": "¿Cómo puedo adaptar la actividad de lectura para Juan?", "mode": "assist", "dimension": "alumno"}'
  ```
- **Response esperado (200):**
  ```json
  {
    "description": {
      "response": "Te propongo usar pictogramas de apoyo durante la lectura guiada...",
      "conversation_id": 55,
      "message_id": 102,
      "identified_student": 7,
      "recommended_device": 4,
      "adaptation": null,
      "referenced_content": null,
      "questions": null,
      "sources_used": { "tools": null, "used_valija": false, "used_student": true, "used_rag": false, "student_ids": [7], "rag_queries": null, "rag_hits": 0 }
    }
  }
  ```

---

**Total de casos:** 62 (uno por endpoint del spec).
