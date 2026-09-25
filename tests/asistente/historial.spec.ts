// spec: specs/historial.md
import { Page } from '@playwright/test';
import { test, expect as baseExpect } from '../../fixtures/base';
import { LoginPage } from '../../pages/login/LoginPage';
import { AsistentePage } from '../../pages/modules/asistentePage';
import users from '../../data/users';

const ASISTENTE_URL = 'https://alizia.educabot.ai/asistente';

// Timeout de aserción ampliado: varios pasos disparan una llamada real al LLM del backend.
const expect = baseExpect.configure({ timeout: 20000 });

// Botones fijos de la UI que nunca son "una opción de respuesta" (para distinguirlos de
// los botones de opciones sugeridas, cuyo texto es dinámico y no se puede predecir).
const NON_ANSWER_BUTTON_NAMES = new Set([
  'Me gusta',
  'No me gusta',
  'Copiar',
  'Favorito',
  'Volver',
  'Ver conversaciones anteriores',
  'Pregunta anterior',
  'Pregunta siguiente',
  'Descartar preguntas',
  'Siguiente',
  'Enviar respuestas',
  'Omitir pregunta',
  'Continuar sin responder',
  'Dictar mensaje',
  'Enviar mensaje',
  'Iniciar grabación de voz',
  'Descartar aviso',
  'Ir a valorar',
  // Los chips de acceso rápido de la landing siguen montados en el DOM (fuera de
  // vista) incluso dentro de una conversación — el mismo patrón que el panel de
  // Historial (ver nota en historyToggleButton) — así que hay que excluirlos.
  'Adaptar una actividad para un alumno',
  'Tengo una situación difícil en el aula',
  'Crear un recurso pedagógico',
  'No sé por donde empezar',
]);

// Si la pregunta actual ofrece opciones sugeridas (botones), hace clic en la primera.
// Devuelve false si no hay ninguna (pregunta de solo texto libre).
async function clickFirstSuggestedOption(page: Page): Promise<boolean> {
  const buttons = await page.getByRole('main').getByRole('button').all();
  for (const button of buttons) {
    // El mensaje sigue renderizándose mientras iteramos: un botón de la lista tomada
    // con .all() puede quedar obsoleto/desprenderse del DOM. Un timeout corto evita que
    // eso cuelgue toda la prueba; si falla, simplemente se descarta ese botón.
    const name = (await button.textContent({ timeout: 2000 }).catch(() => null))?.trim() ?? '';
    if (!name || NON_ANSWER_BUTTON_NAMES.has(name)) continue;
    if (await button.isVisible().catch(() => false)) {
      // Se re-consulta por rol+nombre en vez de reusar `button`: para cuando llegamos
      // acá esa referencia puede haber quedado obsoleta por el mismo re-render.
      await page.getByRole('main').getByRole('button', { name, exact: true }).first().click();
      return true;
    }
  }
  return false;
}

// Completa una ronda de preguntas eligiendo, para cada una, la primera opción sugerida
// (o dejándola sin responder si es de solo texto libre y opcional), hasta que el
// asistente termine de generar el recurso. El número de rondas y de preguntas por ronda
// no es determinístico (se observaron hasta 4 rondas durante la exploración): el tope
// de pasos es generoso pero finito — si se alcanza, es una señal real de que algo no cerró.
async function answerResourceQuestionsUntilGenerated(page: Page): Promise<void> {
  const savedResourceText = page.getByText('Te lo dejo guardado en tus recursos.');
  const questionTextbox = page.getByPlaceholder(/Escribí tu respuesta/);
  // Estos 4 botones usan aria-label (no texto visible): textContent() siempre da "",
  // por eso no se puede distinguir cuál es cuál leyendo el DOM — no hace falta,
  // cualquiera de los 4 cumple el mismo rol de "confirmar y avanzar".
  const controlButton = page.getByRole('button', {
    name: /^(Siguiente|Enviar respuestas|Omitir pregunta|Continuar sin responder)$/,
  });
  const MAX_STEPS = 20;
  // Se usa siempre (nunca se deja una pregunta de texto libre sin responder): saltear
  // datos clave como el nombre del alumno hace que el asistente vuelva a pedir el mismo
  // dato en bucle y nunca llegue a generar el recurso (se observó durante el ajuste).
  const GENERIC_ANSWER = 'Sofía, 8 años. Necesita apoyo para empezar sola las tareas.';

  for (let step = 0; step < MAX_STEPS; step++) {
    if (await savedResourceText.isVisible()) return;

    // Esperamos a que termine la llamada al LLM anterior: aparece una ronda nueva (el
    // control para responder) o el recurso final — ambos son un desenlace válido acá.
    await expect(controlButton.or(savedResourceText)).toBeVisible({ timeout: 30000 });
    if (await savedResourceText.isVisible()) return;

    const optionClicked = await clickFirstSuggestedOption(page);
    if (!optionClicked) {
      await questionTextbox.fill(GENERIC_ANSWER);
    }
    await expect(controlButton).toBeEnabled({ timeout: 10000 });
    await controlButton.click();
  }

  throw new Error(`No se generó el recurso pedagógico tras ${MAX_STEPS} pasos de preguntas.`);
}

async function generateResourceConversation(page: Page): Promise<void> {
  const asistentePage = new AsistentePage(page);
  await asistentePage.quickAccessButton('Crear un recurso pedagógico').click();
  await answerResourceQuestionsUntilGenerated(page);
}

test.describe('Historial de conversaciones — Alizia asistente', { tag: '@historial' }, () => {
  // El propio spec advierte que el número de rondas de preguntas no es determinístico,
  // y varias escenarios dependen de la posición del ítem más reciente en una cuenta
  // compartida (Admin) con cientos de conversaciones previas. Correr en serie evita que
  // dos tests de este archivo creen conversaciones al mismo tiempo y se corran la
  // posición ("el primero de la lista") uno a otro.
  //
  // Esto solo ordena los tests DENTRO de un mismo proyecto/navegador: chromium, firefox
  // y webkit corren en workers separados en paralelo por defecto, y los tres pegan
  // contra la MISMA cuenta Admin al mismo tiempo. Se verificó que eso puede pisarse
  // (dos navegadores generando un recurso a la vez) y romper TC-501/TC-502 con errores
  // que no son del producto. Correr este archivo con `--workers=1` para una ejecución
  // multi-navegador confiable.
  test.describe.configure({ mode: 'serial', timeout: 240000 });

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.admin.username, users.admin.password);
    await expect(page).toHaveURL(ASISTENTE_URL);
  });

  test.describe('Apertura y cierre del panel de Historial', { tag: '@historial-apertura-cierre' }, () => {
    test('TC-101-abrir-panel-historial', { tag: '@critical' }, async ({ page }) => {
      const asistentePage = new AsistentePage(page);

      await asistentePage.historyToggleButton.click();

      // El panel nunca se desmonta (queda con width:0 al cerrarse), por lo que
      // toBeVisible() no distingue abierto/cerrado: usamos toBeInViewport().
      await expect(asistentePage.closeHistoryButton).toBeInViewport();
      await expect(asistentePage.historyHeading).toBeVisible();
      await expect(asistentePage.historySearchInput).toBeVisible();

      // La cuenta Admin usada en estas pruebas siempre tiene conversaciones previas
      // (ver credenciales en el spec), por lo que se verifica el caso "con historial".
      await expect(asistentePage.historyLastWeekHeading).toBeVisible();
      await expect(asistentePage.historyItemTitleButton(0)).not.toHaveText('');
      await expect(asistentePage.historyItemMoreOptionsButton(0)).toBeVisible();
    });

    test('TC-102-cerrar-panel-historial-con-boton-cerrar', { tag: '@critical' }, async ({ page }) => {
      const asistentePage = new AsistentePage(page);
      await asistentePage.historyToggleButton.click();
      await expect(asistentePage.closeHistoryButton).toBeInViewport();

      await asistentePage.closeHistoryButton.click();

      await expect(asistentePage.closeHistoryButton).not.toBeInViewport();
    });

    test('TC-103-cerrar-panel-historial-con-boton-toggle-del-header', { tag: '@critical' }, async ({ page }) => {
      const asistentePage = new AsistentePage(page);
      await asistentePage.historyToggleButton.click();
      await expect(asistentePage.closeHistoryButton).toBeInViewport();

      // Mismo botón que lo abrió: no cambia de nombre accesible, actúa como toggle.
      await asistentePage.historyToggleButton.click();

      await expect(asistentePage.closeHistoryButton).not.toBeInViewport();
    });
  });

  test.describe('Contenido del historial desplegado', { tag: '@historial-contenido' }, () => {
    test('TC-201-historial-desplegado-muestra-conversaciones-previas', { tag: '@critical' }, async ({ page }) => {
      const asistentePage = new AsistentePage(page);
      await asistentePage.historyToggleButton.click();

      await expect(asistentePage.historyLastWeekHeading).toBeVisible();
      await expect(asistentePage.historyItemTitleButton(0)).not.toHaveText('');
      await expect(asistentePage.historyItemMoreOptionsButton(0)).toBeVisible();
      await expect(asistentePage.historySearchInput).toBeVisible();
      await expect(asistentePage.historySearchInput).toBeEmpty();
    });

    test('TC-202-buscador-de-historial-filtra-por-texto', { tag: '@critical' }, async ({ page }) => {
      const asistentePage = new AsistentePage(page);
      await asistentePage.historyToggleButton.click();
      await expect(asistentePage.historyLastWeekHeading).toBeVisible();

      await asistentePage.historySearchInput.fill('situación');

      await expect(asistentePage.historyItem('Tengo una situación difícil en el aula').first()).toBeVisible();
      await expect(asistentePage.historyItem('Crear un recurso pedagógico')).toHaveCount(0);
      await expect(asistentePage.historyItem('Adaptar una actividad para un alumno')).toHaveCount(0);
      await expect(asistentePage.historyItem('No sé por donde empezar')).toHaveCount(0);
    });

    test('TC-203-menu-mas-opciones-de-un-item-del-historial', { tag: '@critical' }, async ({ page }) => {
      const asistentePage = new AsistentePage(page);
      await asistentePage.historyToggleButton.click();
      await expect(asistentePage.historyLastWeekHeading).toBeVisible();

      const originalTitle = await asistentePage.historyItemTitleButton(0).textContent();

      await asistentePage.historyItemMoreOptionsButton(0).click();
      await expect(asistentePage.renameMenuItem).toBeVisible();
      await expect(asistentePage.deleteMenuItem).toBeVisible();

      // Nota (verificado en la app real): ni `Escape` ni clickear otro elemento del
      // panel cierran este menú; solo lo cierra un clic en el propio botón toggle.
      await asistentePage.historyItemMoreOptionsButton(0).click();

      await expect(asistentePage.renameMenuItem).not.toBeVisible();
      await expect(asistentePage.historyItemTitleButton(0)).toHaveText(originalTitle ?? '');
    });
  });

  test.describe.skip('Nueva conversación se guarda en el historial', { tag: '@historial-nueva-conversacion' }, () => {
    test('TC-301-nueva-conversacion-por-chip-aparece-en-historial', { tag: '@critical' }, async ({ page }) => {
      const asistentePage = new AsistentePage(page);
      const chipText = 'Tengo una situación difícil en el aula';

      const [response] = await Promise.all([
        page.waitForResponse((res) => res.url().includes('/api/v1/inclusion/assist') && res.request().method() === 'POST'),
        asistentePage.quickAccessButton(chipText).click(),
      ]);
      expect(response.status()).toBe(200);

      // Al iniciar la conversación, el header cambia: ya no está el "Historial" del
      // banner de la landing, sino "Ver conversaciones anteriores" (mismo panel).
      await asistentePage.viewPreviousConversationsButton.click();
      await expect(asistentePage.historyItemTitleButton(0)).toHaveText(chipText);

      await asistentePage.backButton.click();
      await expect(page).toHaveURL(ASISTENTE_URL);
      await expect(asistentePage.historyItemTitleButton(0)).toHaveText(chipText);
    });

    test('TC-302-nueva-conversacion-por-mensaje-libre-aparece-en-historial', { tag: '@critical' }, async ({ page }) => {
      const asistentePage = new AsistentePage(page);
      // Corto a propósito: el título del ítem del historial trunca (con "…" real en el
      // DOM, no solo CSS) los mensajes largos, lo que rompe una comparación exacta.
      const messageText = 'Necesito ideas para el aula';

      await asistentePage.messageInput.fill(messageText);
      const [response] = await Promise.all([
        page.waitForResponse((res) => res.url().includes('/api/v1/inclusion/assist') && res.request().method() === 'POST'),
        asistentePage.sendButton.click(),
      ]);
      expect(response.status()).toBe(200);
      expect(response.request().postDataJSON().message).toBe(messageText);

      await asistentePage.viewPreviousConversationsButton.click();
      await expect(asistentePage.historyItemTitleButton(0)).toHaveText(messageText);

      await asistentePage.backButton.click();
      await expect(page).toHaveURL(ASISTENTE_URL);
      await expect(asistentePage.historyItemTitleButton(0)).toHaveText(messageText);
    });
  });

  test.describe.skip('Persistencia de los datos de una conversación guardada', { tag: '@historial-persistencia' }, () => {
    test('TC-401-reabrir-conversacion-guardada-muestra-mismo-contenido', { tag: '@critical' }, async ({ page }) => {
      const asistentePage = new AsistentePage(page);
      await asistentePage.historyToggleButton.click();
      await expect(asistentePage.historyLastWeekHeading).toBeVisible();

      await asistentePage.historyItemTitleButton(0).click();

      await expect(asistentePage.conversationHeading).toBeVisible();
      await expect(asistentePage.backButton).toBeVisible();
      await expect(asistentePage.viewPreviousConversationsButton).toBeVisible();

      // No hay estado ARIA (aria-current/aria-selected) para el ítem activo: se marca
      // solo con una clase de fondo. Es la única forma de verificar esta marca visual.
      await expect(asistentePage.historyItemTitleButton(0).locator('..')).toHaveClass(/bg-gray-100/);

      await expect(page.getByRole('main').getByRole('paragraph').first()).not.toHaveText('');
    });

    test('TC-402-contenido-de-la-conversacion-persiste-tras-reload', { tag: '@critical' }, async ({ page }) => {
      const asistentePage = new AsistentePage(page);
      await asistentePage.historyToggleButton.click();
      await expect(asistentePage.historyLastWeekHeading).toBeVisible();

      await asistentePage.historyItemTitleButton(0).click();
      await expect(asistentePage.conversationHeading).toBeVisible();

      const firstMessage = page.getByRole('main').getByRole('paragraph').first();
      const originalContent = await firstMessage.textContent();

      await page.reload();

      await expect(page).toHaveURL(ASISTENTE_URL);
      await expect(asistentePage.helpPrompt).toBeVisible();
      await expect(asistentePage.closeHistoryButton).not.toBeInViewport();

      // Se reabre por posición (el tope de "Últimos 7 días"): al correr en serie y sin
      // crear conversaciones nuevas dentro de este test, sigue siendo la misma
      // conversación que se abrió antes del reload.
      await asistentePage.historyToggleButton.click();
      await asistentePage.historyItemTitleButton(0).click();

      await expect(asistentePage.conversationHeading).toBeVisible();
      await expect(firstMessage).toHaveText(originalContent ?? '');
    });
  });

  test.describe.skip('Elementos generados en una conversación guardada son accesibles y clickeables', { tag: '@historial-elementos-generados' }, () => {
    test.skip('TC-501-recurso-pedagogico-generado-abre-su-preview-desde-historial', { tag: '@critical' }, async ({ page }) => {
      const asistentePage = new AsistentePage(page);

      await generateResourceConversation(page);
      await expect(page.getByText('Te lo dejo guardado en tus recursos.')).toBeVisible();

      // El escenario verifica el recurso reabriendo la conversación desde el Historial
      // (no en la conversación recién creada), tal como describe el spec.
      await asistentePage.backButton.click();
      await expect(page).toHaveURL(ASISTENTE_URL);
      await asistentePage.historyToggleButton.click();
      await asistentePage.historyItemTitleButton(0).click();
      await expect(page.getByText('Te lo dejo guardado en tus recursos.')).toBeVisible();

      const resourceCard = asistentePage.resourceCard();
      await expect(resourceCard).toBeEnabled();
      await resourceCard.focus();
      await expect(resourceCard).toBeFocused();

      await resourceCard.click();

      await expect(page).toHaveURL(ASISTENTE_URL);
      await expect(asistentePage.resourcePanelText).toBeVisible();
      await expect(asistentePage.closeResourcePanelButton).toBeVisible();

      const situacionLabel = page.getByRole('complementary').getByText('Situación trabajada', { exact: true });
      const adaptacionLabel = page.getByRole('complementary').getByText('Adaptación generada', { exact: true });
      await expect(situacionLabel).toBeVisible();
      await expect(adaptacionLabel).toBeVisible();
      // Las secciones son párrafos sin rol semántico propio: el contenido es el <p>
      // hermano siguiente dentro del mismo contenedor.
      await expect(situacionLabel.locator('..').getByRole('paragraph').nth(1)).not.toHaveText('');
      await expect(adaptacionLabel.locator('..').getByRole('paragraph').nth(1)).not.toHaveText('');

      await asistentePage.closeResourcePanelButton.click();
      await expect(asistentePage.resourcePanelText).not.toBeVisible();
      // El espacio lateral queda vacío: ni el recurso ni el Historial se reabren solos.
      // toBeVisible() no sirve aquí (ver nota en TC-102/103): se usa toBeInViewport().
      await expect(asistentePage.closeHistoryButton).not.toBeInViewport();
    });

    test('TC-502-descarga-del-archivo-del-recurso-pedagogico-desde-el-preview', { tag: '@critical' }, async ({ page }) => {
      const asistentePage = new AsistentePage(page);

      await generateResourceConversation(page);
      await expect(page.getByText('Te lo dejo guardado en tus recursos.')).toBeVisible();

      await asistentePage.backButton.click();
      await expect(page).toHaveURL(ASISTENTE_URL);
      await asistentePage.historyToggleButton.click();
      await asistentePage.historyItemTitleButton(0).click();
      await asistentePage.resourceCard().click();
      await expect(asistentePage.resourcePanelText).toBeVisible();

      // El botón de descarga es el último botón del panel (el primero es "Cerrar"); su
      // nombre accesible no es estable porque depende del recurso generado por el LLM.
      const downloadButton = page.getByRole('complementary').getByRole('button').last();
      await expect(downloadButton).toBeVisible();

      page.once('dialog', (dialog) => dialog.accept());
      const [download] = await Promise.all([page.waitForEvent('download'), downloadButton.click()]);
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);

      page.once('dialog', (dialog) => dialog.dismiss());
      let downloadFired = false;
      page.once('download', () => {
        downloadFired = true;
      });
      await downloadButton.click();
      await page.waitForTimeout(1000);
      expect(downloadFired).toBe(false);
      await expect(asistentePage.resourcePanelText).toBeVisible();
    });
  });
});
