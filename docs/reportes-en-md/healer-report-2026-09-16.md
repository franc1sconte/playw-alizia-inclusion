# Healer Report — 2026-09-16

**Disparado por:** `docs/instructions.md` (rol Healer de la skill `playwright-cli`).
**Referencia:** run de CI con fallos — https://franc1sconte.github.io/playw-alizia-inclusion/

## Resumen

De los 26 fallos reportados en la run de CI, se reprodujeron todos localmente. Se dividen en dos grupos:

1. Una causa raíz real (aserción/spec desactualizada por un cambio de UI legítimo) → **corregida y verificada**.
2. Flakiness de infraestructura de backend bajo carga concurrente → **sin cambios de código**, documentado.

## 1. Fix aplicado — `tests/rol/rol-access.spec.ts`

### Síntoma

Fallaban en los 3 navegadores (chromium, firefox, webkit):
- TC-001 `navegacion-completa-visible-admin`
- TC-009 `navegacion-limitada-visible-teacher`
- TC-014 `aulas-no-accesible-por-url-teacher`
- TC-015 `docentes-no-accesible-por-url-teacher`

Error: `expect(locator).toHaveText(expected)` — el locator `nav.getByRole('link')` devolvía un elemento más de lo esperado.

### Diagnóstico

Se reprodujo el fallo, se corrió el test en modo debug (`--debug=cli`) y se inspeccionó el DOM real con `playwright-cli` (login como admin y teacher, snapshot + `eval` del elemento nuevo).

Resultado: la app agregó un link nuevo y permanente al nav, visible para **ambos roles** (admin y teacher):

- Texto visible: **"Comunidad de WhatsApp"** con subtítulo "Unite al grupo de docentes".
- Es un `<a>` funcional, con ícono, `href="https://chat.whatsapp.com/..."` real y `target="_blank"`.
- Estructuralmente vive dentro del `<nav>`, por eso lo capturaba el locator `nav.getByRole('link')`.
- Detalle técnico: el título y el subtítulo son dos `<span>` separados sin espacio entre sí, así que el `textContent` real concatenado es `"Comunidad de WhatsAppUnite al grupo de docentes"`, distinto del nombre accesible corto (`title="Comunidad de WhatsApp"` del `<a>`).

**Clasificación:** cambio de UI legítimo (feature nueva), no locator drift accidental ni regresión. La aserción y el spec estaban desactualizados frente a un comportamiento real y bien construido de la app — no hay indicios de bug.

### Corrección aplicada

- `tests/rol/rol-access.spec.ts`:
  - Se agregaron las constantes `WHATSAPP_LINK_TEXT` (texto completo, para `toHaveText`) y `WHATSAPP_LINK_NAME` (nombre accesible corto, para locators por rol).
  - Se sumó el link nuevo a las 4 aserciones de nav afectadas (TC-001, TC-009, TC-014, TC-015), sin debilitar ninguna aserción existente.
  - Se agregó el chequeo `toBeEnabled()` del link nuevo en TC-001, igual que para el resto de los módulos.
- `specs/alizia-roles-navegacion.md`: se actualizó el conteo de enlaces esperado (7→8 para Admin, 4→5 para Teacher) y se documentó el link fijo nuevo como no ligado al rol.

### Verificación

`npx playwright test tests/rol/rol-access.spec.ts` (chromium + firefox + webkit, 45 tests) corrido **dos veces** para confirmar estabilidad:

| Corrida | Resultado |
|---|---|
| 1 | 45/45 passed |
| 2 | 45/45 passed |

No se usó `waitForTimeout`, no se aumentaron timeouts, no se hizo `skip` de ningún test.

## 2. Sin cambios de código — flakiness de backend bajo carga concurrente

### `tests/assist/chat-assist.spec.ts` (TC-001 a TC-004)

En la run completa de CI fallaron 12 casos (combinaciones de rol/browser) con errores variados. Al correr el archivo aislado (sin el resto de la suite compitiendo por el backend), solo falló 1 de 8 con:

```
Expected: 200
Received: 503
```

Al reintentar ese mismo caso (`TC-003-chip-crear-recurso-pedagogico-teacher`) en solitario, **pasó sin modificar nada**.

### `tests/asistente/historial.spec.ts` (TC-501)

Mismo patrón: fallaba en la run completa (chromium y firefox), pasó en ambos navegadores al aislarlo.

### Interpretación

Ambos archivos ya documentan en comentarios que el backend (Railway) tiene latencia intermitente de arranque en frío y que estos tests disparan llamadas reales al LLM. Con 6 workers en paralelo pegándole al mismo endpoint (`/api/v1/inclusion/assist`), aparecen 503s/timeouts puntuales que no se reproducen corriendo los tests solos.

**No se modificó código de test.** No es un problema de locator ni de aserción. Si se repite seguido en CI, vale la pena que el equipo de backend revise capacidad/rate-limiting del endpoint bajo carga concurrente, o evaluar bajar la paralelización de esta suite específica en CI.

### `tests/example.spec.ts` (firefox)

Descartado del análisis: es el test boilerplate de template de Playwright, no pertenece a la app.

## Resultado neto

| Causa | Acción | Estado |
|---|---|---|
| Link "Comunidad de WhatsApp" nuevo en el nav, no contemplado en tests/spec | Fix en `rol-access.spec.ts` + `alizia-roles-navegacion.md` | ✅ Corregido, verificado 2/2 |
| 503 intermitente en `/api/v1/inclusion/assist` bajo carga concurrente | Ninguna (infraestructura) | ⚠️ Documentado, a seguimiento del equipo de backend |
| `example.spec.ts` en firefox | Ninguna | Descartado (boilerplate de template) |
