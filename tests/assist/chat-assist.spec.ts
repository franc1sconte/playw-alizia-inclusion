import { Page } from '@playwright/test';
import { test, expect as baseExpect } from '../../fixtures/base';
import { LoginPage } from '../../pages/login/LoginPage';
import { AsistentePage } from '../../pages/modules/asistentePage';
import users from '../../data/users';

const ASISTENTE_URL = 'https://alizia.educabot.ai/asistente';
const ASSIST_ENDPOINT_PATH = '/api/v1/inclusion/assist';

// Timeout de aserción ampliado: cada test dispara una llamada real al LLM del backend.
const expect = baseExpect.configure({ timeout: 20000 });

async function closeWelcomeModalIfPresent(page: Page): Promise<void> {
  const continueButton = page.getByRole('button', { name: 'Continuar' });
  try {
    await continueButton.waitFor({ state: 'visible', timeout: 5000 });
    await continueButton.click();
  } catch {
    // El modal de bienvenida no apareció.
  }
}

/**
 * El backend responde de forma no determinística: para el mismo chip, a veces devuelve
 * `questions` estructuradas (paginadas) y a veces no (en cuyo caso el front muestra un
 * textbox libre). Por eso la aserción del "follow-up" se adapta a lo que efectivamente
 * se renderizó, en vez de asumir una estructura fija por chip.
 */
async function expectAdaptiveFollowUp(asistentePage: AsistentePage): Promise<void> {
  await expect(asistentePage.questionPaginationLabel.or(asistentePage.freeformAssistantInput)).toBeVisible();

  if (await asistentePage.questionPaginationLabel.isVisible()) {
    await expect(asistentePage.questionPaginationLabel).toHaveText(/^1 de \d+$/);
    await expect(asistentePage.previousQuestionButton).toBeDisabled();
    await expect(asistentePage.discardQuestionsButton).toBeVisible();
  } else {
    await expect(asistentePage.freeformAssistantInput).toBeVisible();
    await expect(asistentePage.voiceRecordButton).toBeVisible();
  }
}

async function runQuickAccessScenario(page: Page, chipText: string): Promise<void> {
  const asistentePage = new AsistentePage(page);

  const [response] = await Promise.all([
    page.waitForResponse((res) => res.url().includes(ASSIST_ENDPOINT_PATH) && res.request().method() === 'POST'),
    asistentePage.quickAccessButton(chipText).click(),
  ]);
  expect(response.status()).toBe(200);
  expect(response.request().postDataJSON().message).toBe(chipText);

  await expect(asistentePage.conversationHeading).toBeVisible();
  await expect(asistentePage.backButton).toBeVisible();
  await expect(asistentePage.viewPreviousConversationsButton).toBeVisible();
  await expect(asistentePage.chatText(chipText)).toBeVisible();

  // La respuesta del asistente (texto generado por LLM, no determinístico) se valida
  // indirectamente: sus acciones solo se renderizan una vez que la respuesta llegó.
  await expect(asistentePage.likeButton).toBeVisible();
  await expect(asistentePage.dislikeButton).toBeVisible();
  await expect(asistentePage.copyButton).toBeVisible();
  await expect(asistentePage.favoriteButton).toBeVisible();

  await expectAdaptiveFollowUp(asistentePage);

  await asistentePage.backButton.click();
  await expect(page).toHaveURL(ASISTENTE_URL);
  await expect(asistentePage.quickAccessButton(chipText)).toBeVisible();
  await expect(asistentePage.historyItem(chipText)).toBeVisible();
}

function runChipScenarios(
  roleLabel: string,
  credentials: { username: string; password: string },
  closeModal: boolean
): void {
  test.describe(`Chips de acceso rápido — ${roleLabel}`, () => {
    test.describe.configure({ timeout: 90000 });

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(credentials.username, credentials.password);
      await expect(page).toHaveURL(ASISTENTE_URL);
      if (closeModal) {
        await closeWelcomeModalIfPresent(page);
      }
    });

    test(`TC-001-chip-adaptar-actividad-alumno-${roleLabel.toLowerCase()}`, { tag: '@critical' }, async ({ page }) => {
      await runQuickAccessScenario(page, 'Adaptar una actividad para un alumno');
    });

    test(`TC-002-chip-situacion-dificil-aula-${roleLabel.toLowerCase()}`, { tag: '@critical' }, async ({ page }) => {
      await runQuickAccessScenario(page, 'Tengo una situación difícil en el aula');
    });

    test(`TC-003-chip-crear-recurso-pedagogico-${roleLabel.toLowerCase()}`, { tag: '@critical' }, async ({ page }) => {
      await runQuickAccessScenario(page, 'Crear un recurso pedagógico');
    });

    test(`TC-004-chip-no-se-por-donde-empezar-${roleLabel.toLowerCase()}`, { tag: '@critical' }, async ({ page }) => {
      await runQuickAccessScenario(page, 'No sé por donde empezar');
    });
  });
}

runChipScenarios('Admin', users.admin, false);
runChipScenarios('Teacher', users.teacher2, true);
