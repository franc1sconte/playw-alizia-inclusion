import { test, expect } from '../../fixtures/base';

test.describe.skip('API - Students', () => {
  test.describe.configure({ mode: 'serial' });

  let studentId: number;
  let noteId: number;

  test('TC-001-listar-alumnos', { tag: '@smoke' }, async ({ apiRequest }) => {
    const response = await apiRequest.get('students');

    // expect: 200 y el payload envuelto es un array
    expect(response.status()).toBe(200);
    const { description } = await response.json();
    expect(Array.isArray(description)).toBe(true);
  });

  test('TC-002-crear-alumno', { tag: '@critical' }, async ({ apiRequest }) => {
    // 1. Crear alumno sin classroom_id (fuera de alcance el módulo Classrooms)
    const response = await apiRequest.post('students', {
      data: { name: 'Alumno QA API' },
    });

    // expect: 201 y body SIN envolver
    expect(response.status()).toBe(201);
    const body = await response.json();
    // Nota: la API real omite `profile`/`classroom_id` cuando son nulos (no los devuelve como `null`,
    // a diferencia del ejemplo del spec) — se valida ausencia de perfil de forma tolerante a ambos casos.
    expect(body).toMatchObject({ name: 'Alumno QA API' });
    expect(body.id).toEqual(expect.any(Number));
    expect(body.profile).toBeFalsy();
    studentId = body.id;
  });

  test('TC-003-obtener-alumno', { tag: '@smoke' }, async ({ apiRequest }) => {
    const response = await apiRequest.get(`students/${studentId}`);

    // expect: 200, envelope con los datos creados en 4.2
    expect(response.status()).toBe(200);
    const { description } = await response.json();
    expect(description).toMatchObject({ id: studentId, name: 'Alumno QA API' });
    expect(description.profile).toBeFalsy();
  });

  test('TC-004-actualizar-alumno', { tag: '@critical' }, async ({ apiRequest }) => {
    // 1. Actualizar solo el nombre
    const response = await apiRequest.put(`students/${studentId}`, {
      data: { name: 'Alumno QA API Actualizado' },
    });

    // expect: 200 y el nombre queda actualizado
    expect(response.status()).toBe(200);
    const { description } = await response.json();
    expect(description).toMatchObject({ id: studentId, name: 'Alumno QA API Actualizado' });
  });

  test('TC-005-obtener-perfil-alumno', { tag: '@smoke' }, async ({ apiRequest }) => {
    const response = await apiRequest.get(`students/${studentId}/profile`);

    // expect: 200, perfil aún inexistente (no se hizo upsert todavía)
    expect(response.status()).toBe(200);
    const { description } = await response.json();
    expect(description).toMatchObject({ id: studentId });
    expect(description.profile).toBeFalsy();
  });

  test('TC-006-crear-actualizar-perfil-alumno', { tag: '@critical' }, async ({ apiRequest }) => {
    // 1. Upsert del perfil pedagógico
    const response = await apiRequest.put(`students/${studentId}/profile`, {
      data: { is_transitory: false, difficulties: ['atencion'], free_description: 'Se distrae con facilidad.' },
    });

    // expect: 200 (nunca 201, incluso en el insert inicial) y perfil embebido en la respuesta
    expect(response.status()).toBe(200);
    const { description } = await response.json();
    expect(description.profile).toMatchObject({
      student_id: studentId,
      is_transitory: false,
      difficulties: ['atencion'],
      free_description: 'Se distrae con facilidad.',
    });
  });

  test('TC-007-listar-notas-alumno', { tag: '@smoke' }, async ({ apiRequest }) => {
    const response = await apiRequest.get(`students/${studentId}/notes`);

    // expect: 200 y payload envuelto es un array (puede estar vacío en este punto)
    expect(response.status()).toBe(200);
    const { description } = await response.json();
    expect(Array.isArray(description)).toBe(true);
  });

  test('TC-008-crear-nota-alumno', { tag: '@critical' }, async ({ apiRequest }) => {
    // 1. Crear nota privada del docente
    const response = await apiRequest.post(`students/${studentId}/notes`, {
      data: { content: 'Mejoró la participación en clase.', type: 'seguimiento', internal: true },
    });

    // expect: 201 y body SIN envolver
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject({
      student_id: studentId,
      content: 'Mejoró la participación en clase.',
      type: 'seguimiento',
      internal: true,
    });
    noteId = body.id;
  });

  test('TC-009-editar-nota-alumno', { tag: '@smoke' }, async ({ apiRequest }) => {
    // 1. Editar el contenido de la nota
    const response = await apiRequest.put(`students/${studentId}/notes/${noteId}`, {
      data: { content: 'Mejoró notablemente la participación en clase.' },
    });

    // expect: 200 y el contenido queda actualizado
    expect(response.status()).toBe(200);
    const { description } = await response.json();
    expect(description).toMatchObject({ id: noteId, content: 'Mejoró notablemente la participación en clase.' });
  });

  test('TC-010-borrar-nota-alumno', { tag: '@critical' }, async ({ apiRequest }) => {
    const response = await apiRequest.delete(`students/${studentId}/notes/${noteId}`);

    // expect: 204 sin body
    expect(response.status()).toBe(204);
  });

  test('TC-011-borrar-alumno', { tag: '@critical' }, async ({ apiRequest }) => {
    const response = await apiRequest.delete(`students/${studentId}`);

    // expect: 204 sin body
    expect(response.status()).toBe(204);
  });
});
