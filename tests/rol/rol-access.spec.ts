import { Page } from '@playwright/test';
import { test, expect } from '../../fixtures/base';
import { LoginPage } from '../../pages/login/LoginPage';
import { AsistentePage } from '../../pages/modules/asistentePage';
import { PrimerosPasosPage } from '../../pages/modules/primerosPasosPage';
import { MaterialesPage } from '../../pages/modules/materialesPage';
import { RecursosPage } from '../../pages/modules/recursosPage';
import { AulasPage } from '../../pages/modules/aulasPage';
import { DocentesPage } from '../../pages/modules/docentesPage';
import users from '../../data/users.json';

const ASISTENTE_URL = 'https://alizia.educabot.ai/asistente';

async function closeWelcomeModalIfPresent(page: Page): Promise<void> {
  const continueButton = page.getByRole('button', { name: 'Continuar' });
  try {
    await continueButton.waitFor({ state: 'visible', timeout: 5000 });
    await continueButton.click();
  } catch {
    // El modal de bienvenida no apareció.
  }
}

test.describe('Rol Admin — Navegación y módulos', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.admin.username, users.admin.password);
    await expect(page).toHaveURL(ASISTENTE_URL);
  });

  test('navegacion-completa-visible-admin', { tag: '@smoke' }, async ({ page }) => {
    const asistentePage = new AsistentePage(page);
    const expectedLinks = ['Alizia asistente', 'Primeros pasos', 'Materiales', 'Recursos pedagógicos', 'Aulas', 'Docentes'];

    await expect(asistentePage.nav.links).toHaveText(expectedLinks);
    for (const name of expectedLinks) {
      await expect(asistentePage.nav.link(name)).toBeEnabled();
    }
    await expect(asistentePage.nav.userMenuButton).toBeVisible();
    await expect(asistentePage.nav.userMenuButton).toContainText('A');
  });

  test('acceso-alizia-asistente-admin', { tag: '@critical' }, async ({ page }) => {
    const asistentePage = new AsistentePage(page);

    await expect(page).toHaveURL(ASISTENTE_URL);
    await expect(asistentePage.greeting).toHaveText('Hola Administrador,');
    await expect(asistentePage.helpPrompt).toBeVisible();
    await expect(asistentePage.messageInput).toBeVisible();
    await expect(asistentePage.dictateButton).toBeVisible();
    await expect(asistentePage.sendButton).toBeDisabled();

    const quickAccessLabels = [
      'Adaptar una actividad para un alumno',
      'Tengo una situación difícil en el aula',
      'Crear un recurso pedagógico',
      'No sé por donde empezar',
    ];
    for (const label of quickAccessLabels) {
      await expect(asistentePage.quickAccessButton(label)).toBeVisible();
    }

    await expect(asistentePage.historyHeading).toBeVisible();
    await expect(asistentePage.historySearchInput).toBeVisible();
  });

  test('acceso-primeros-pasos-admin', { tag: '@smoke' }, async ({ page }) => {
    const asistentePage = new AsistentePage(page);
    await asistentePage.nav.clickLink('Primeros pasos');

    const primerosPasosPage = new PrimerosPasosPage(page);
    await expect(page).toHaveURL('https://alizia.educabot.ai/primeros-pasos');
    await expect(primerosPasosPage.nav.link('Primeros pasos')).toHaveAttribute('aria-current', 'page');
    await expect(primerosPasosPage.heading).toBeVisible();
    await expect(primerosPasosPage.valijaHeading).toBeVisible();
    await expect(primerosPasosPage.exploraValijaText).toBeVisible();
    await expect(primerosPasosPage.assistantAccessButton).toBeVisible();
    await expect(primerosPasosPage.materialsAccessButton).toBeVisible();
  });

  test('acceso-materiales-admin', { tag: '@smoke' }, async ({ page }) => {
    const asistentePage = new AsistentePage(page);
    await asistentePage.nav.clickLink('Materiales');

    const materialesPage = new MaterialesPage(page);
    await expect(page).toHaveURL('https://alizia.educabot.ai/materiales');
    await expect(materialesPage.heading).toBeVisible();
    await expect(materialesPage.searchInput).toBeVisible();

    const categoryLabels = ['Todos', 'Regulación', 'Atención', 'Organización', 'Lecto-escritura', 'Tecnología'];
    for (const label of categoryLabels) {
      await expect(materialesPage.categoryFilterButton(label)).toBeVisible();
    }
    await expect(materialesPage.categoryGroupHeading('Regulación sensorial y motriz')).toBeVisible();
  });

  test('acceso-recursos-pedagogicos-admin', { tag: '@smoke' }, async ({ page }) => {
    const asistentePage = new AsistentePage(page);
    await asistentePage.nav.clickLink('Recursos pedagógicos');

    const recursosPage = new RecursosPage(page);
    await expect(page).toHaveURL('https://alizia.educabot.ai/recursos');
    await expect(recursosPage.heading).toBeVisible();
    await expect(recursosPage.createButton).toBeVisible();
    await expect(recursosPage.searchInput).toBeVisible();

    const groupTabLabels = ['Recientes', 'Materiales', 'Alumnos', 'Necesidades'];
    for (const label of groupTabLabels) {
      await expect(recursosPage.groupTab(label)).toBeVisible();
    }
    await expect(recursosPage.groupTab('Recientes')).toHaveAttribute('aria-selected', 'true');

    const timeRangeLabels = ['Todos', 'Hoy', 'Esta semana', 'Este mes'];
    for (const label of timeRangeLabels) {
      await expect(recursosPage.timeRangeButton(label)).toBeVisible();
    }
    await expect(recursosPage.timeRangeButton('Todos')).toHaveAttribute('aria-pressed', 'true');

    await expect(recursosPage.resourcesPanel).toBeVisible();
  });

  test('acceso-aulas-admin', { tag: '@critical' }, async ({ page }) => {
    const asistentePage = new AsistentePage(page);
    await asistentePage.nav.clickLink('Aulas');

    const aulasPage = new AulasPage(page);
    await expect(page).toHaveURL('https://alizia.educabot.ai/admin/aulas');
    await expect(aulasPage.backButton).toBeVisible();
    await expect(aulasPage.heading).toBeVisible();
    await expect(aulasPage.subtitle).toBeVisible();
    await expect(aulasPage.newClassroomButton).toBeVisible();
    await expect(aulasPage.classroomHeading('1ro A')).toBeVisible();
    await expect(aulasPage.editClassroomButton('1ro A')).toBeVisible();
    await expect(aulasPage.deleteClassroomButton('1ro A')).toBeVisible();
  });

  test('acceso-docentes-admin', { tag: '@critical' }, async ({ page }) => {
    const asistentePage = new AsistentePage(page);
    await asistentePage.nav.clickLink('Docentes');

    const docentesPage = new DocentesPage(page);
    await expect(page).toHaveURL('https://alizia.educabot.ai/admin/docentes');
    await expect(docentesPage.backButton).toBeVisible();
    await expect(docentesPage.heading).toBeVisible();
    await expect(docentesPage.subtitle).toBeVisible();
    await expect(docentesPage.newTeacherButton).toBeVisible();
    await expect(docentesPage.teacherHeading('Carlos Bianchi')).toBeVisible();
    await expect(docentesPage.unenrollTeacherButton('Carlos Bianchi')).toBeVisible();
  });
});

test.describe('Rol Teacher — Navegación y módulos', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.teacher.username, users.teacher.password);
    await expect(page).toHaveURL(ASISTENTE_URL);
    await closeWelcomeModalIfPresent(page);
  });

  test('navegacion-limitada-visible-teacher', { tag: '@smoke' }, async ({ page }) => {
    const asistentePage = new AsistentePage(page);
    const expectedLinks = ['Alizia asistente', 'Primeros pasos', 'Materiales', 'Recursos pedagógicos'];

    await expect(asistentePage.nav.links).toHaveText(expectedLinks);
    await expect(asistentePage.nav.link('Aulas')).toHaveCount(0);
    await expect(asistentePage.nav.link('Docentes')).toHaveCount(0);
    await expect(asistentePage.nav.userMenuButton).toBeVisible();
    await expect(asistentePage.nav.userMenuButton).toContainText('C');
  });

  test('acceso-alizia-asistente-teacher', { tag: '@critical' }, async ({ page }) => {
    const asistentePage = new AsistentePage(page);

    await expect(page).toHaveURL(ASISTENTE_URL);
    await expect(asistentePage.greeting).toHaveText('Hola Carlos,');
    await expect(asistentePage.helpPrompt).toBeVisible();

    const quickAccessLabels = [
      'Adaptar una actividad para un alumno',
      'Tengo una situación difícil en el aula',
      'Crear un recurso pedagógico',
      'No sé por donde empezar',
    ];
    for (const label of quickAccessLabels) {
      await expect(asistentePage.quickAccessButton(label)).toBeVisible();
    }

    await expect(asistentePage.toolsAccessSection).toBeVisible();
    await expect(asistentePage.toolsAccessCard('Primeros pasos Ideas y ayuda para comenzar')).toBeVisible();
    await expect(asistentePage.toolsAccessCard('Materiales Recursos listos para usar')).toBeVisible();
    await expect(asistentePage.toolsAccessCard('Recursos pedagógicos Adaptaciones y estrategias')).toBeVisible();
  });

  test('acceso-primeros-pasos-teacher', { tag: '@smoke' }, async ({ page }) => {
    const asistentePage = new AsistentePage(page);
    await asistentePage.nav.clickLink('Primeros pasos');

    const primerosPasosPage = new PrimerosPasosPage(page);
    await expect(page).toHaveURL('https://alizia.educabot.ai/primeros-pasos');
    await expect(primerosPasosPage.heading).toBeVisible();
    await expect(primerosPasosPage.valijaHeading).toBeVisible();
    await expect(primerosPasosPage.exploraValijaText).toBeVisible();
  });

  test('acceso-materiales-teacher', { tag: '@smoke' }, async ({ page }) => {
    const asistentePage = new AsistentePage(page);
    await asistentePage.nav.clickLink('Materiales');

    const materialesPage = new MaterialesPage(page);
    await expect(page).toHaveURL('https://alizia.educabot.ai/materiales');
    await expect(materialesPage.heading).toBeVisible();
    await expect(materialesPage.searchInput).toBeVisible();

    const categoryLabels = ['Todos', 'Regulación', 'Atención', 'Organización', 'Lecto-escritura', 'Tecnología'];
    for (const label of categoryLabels) {
      await expect(materialesPage.categoryFilterButton(label)).toBeVisible();
    }
    await expect(materialesPage.categoryGroupHeading('Regulación sensorial y motriz')).toBeVisible();
  });

  test('acceso-recursos-pedagogicos-teacher', { tag: '@smoke' }, async ({ page }) => {
    const asistentePage = new AsistentePage(page);
    await asistentePage.nav.clickLink('Recursos pedagógicos');

    const recursosPage = new RecursosPage(page);
    await expect(page).toHaveURL('https://alizia.educabot.ai/recursos');
    await expect(recursosPage.heading).toBeVisible();
    await expect(recursosPage.createButton).toBeVisible();
    await expect(recursosPage.searchInput).toBeVisible();

    const groupTabLabels = ['Recientes', 'Materiales', 'Alumnos', 'Necesidades'];
    for (const label of groupTabLabels) {
      await expect(recursosPage.groupTab(label)).toBeVisible();
    }
    const timeRangeLabels = ['Todos', 'Hoy', 'Esta semana', 'Este mes'];
    for (const label of timeRangeLabels) {
      await expect(recursosPage.timeRangeButton(label)).toBeVisible();
    }
  });

  test('aulas-no-accesible-por-url-teacher', { tag: '@critical' }, async ({ page }) => {
    await page.goto('https://alizia.educabot.ai/admin/aulas');

    await expect(page).toHaveURL(ASISTENTE_URL);
    const asistentePage = new AsistentePage(page);
    await expect(asistentePage.nav.links).toHaveText(['Alizia asistente', 'Primeros pasos', 'Materiales', 'Recursos pedagógicos']);
  });

  test('docentes-no-accesible-por-url-teacher', { tag: '@critical' }, async ({ page }) => {
    await page.goto('https://alizia.educabot.ai/admin/docentes');

    await expect(page).toHaveURL(ASISTENTE_URL);
    const asistentePage = new AsistentePage(page);
    await expect(asistentePage.nav.links).toHaveText(['Alizia asistente', 'Primeros pasos', 'Materiales', 'Recursos pedagógicos']);
  });
});
