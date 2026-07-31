import { test, expect } from '../../fixtures/base';
import { LoginPage } from '../../pages/login/LoginPage';
import { RecuperarContrasenaPage } from '../../pages/login/recuperarContrasenaPage';
import { AsistentePage } from '../../pages/modules/asistentePage';
import users from '../../data/users.json';

test.describe('Login - Alizia Inclusión', () => {
  test('credenciales-incorrectas', { tag: '@critical' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // 1. Escribir un correo válido pero con contraseña incorrecta
    await loginPage.login('admin@alizia.com', 'wrongpassword123');

    // expect: alerta general de credenciales incorrectas
    await expect(loginPage.credentialsError).toBeVisible();
    await expect(loginPage.credentialsError).toHaveText(
      'El correo electrónico o la contraseña son incorrectos. Revisalos e intentá nuevamente.'
    );
    // expect: la página permanece en /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('olvide-mi-contrasena-navega-a-recuperacion', { tag: '@smoke' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // 1. Hacer clic en el botón "Olvidé mi contraseña"
    await loginPage.forgotPasswordButton.click();

    // expect: navega a /recuperar-contrasena
    await expect(page).toHaveURL('https://alizia.educabot.ai/recuperar-contrasena');
    const recuperarContrasenaPage = new RecuperarContrasenaPage(page);
    // expect: título, texto, campo de correo y botones
    await expect(recuperarContrasenaPage.heading).toBeVisible();
    await expect(recuperarContrasenaPage.description).toBeVisible();
    await expect(recuperarContrasenaPage.emailInput).toBeVisible();
    await expect(recuperarContrasenaPage.sendLinkButton).toBeVisible();
    await expect(recuperarContrasenaPage.backToLoginButton).toBeVisible();

    // 2. Hacer clic en "Volver a Iniciar sesión"
    await recuperarContrasenaPage.backToLogin();

    // expect: regresa a /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('login-exitoso-admin', { tag: '@critical' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // 1-2-3. Escribir credenciales de admin e iniciar sesión
    await loginPage.login(users.admin.username, users.admin.password);

    // expect: redirige a /asistente
    await expect(page).toHaveURL('https://alizia.educabot.ai/asistente');
    // expect: no se muestra ningún mensaje de error
    await expect(loginPage.credentialsError).toBeHidden();
    // expect: el asistente saluda con "Hola Administrador,"
    const asistentePage = new AsistentePage(page);
    await expect(asistentePage.greeting).toHaveText('Hola Administrador,');
  });

  test('login-exitoso-teacher', { tag: '@critical' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // 1-2-3. Escribir credenciales de teacher e iniciar sesión
    await loginPage.login(users.teacher2.username, users.teacher2.password);

    // expect: redirige a /asistente
    await expect(page).toHaveURL('https://alizia.educabot.ai/asistente');
    // expect: no se muestra ningún mensaje de error
    await expect(loginPage.credentialsError).toBeHidden();
    // expect: el asistente saluda con "Hola Carlos,"
    const asistentePage = new AsistentePage(page);
    await expect(asistentePage.greeting).toHaveText('Hola Carlos,');
    // expect: modal de bienvenida "Alizia inclusión" con botón "Continuar"
    await expect(asistentePage.welcomeModalHeading).toBeVisible();
    await expect(asistentePage.welcomeModalContinueButton).toBeVisible();
  });

  test('cerrar-sesion', { tag: '@critical' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.admin.username, users.admin.password);
    await expect(page).toHaveURL('https://alizia.educabot.ai/asistente');

    const asistentePage = new AsistentePage(page);
    // 1. Hacer clic en el botón "Menú de usuario"
    await asistentePage.nav.openUserMenu();

    // expect: el menú muestra nombre completo, correo e institución
    await expect(asistentePage.nav.userMenuText('Administrador Alizia')).toBeVisible();
    await expect(asistentePage.nav.userMenuText('admin@alizia.com')).toBeVisible();
    await expect(asistentePage.nav.userMenuText('Alizia Inclusión')).toBeVisible();

    // 2. Hacer clic en "Cerrar sesión"
    await asistentePage.nav.logout();

    // expect: redirige a /login
    await expect(page).toHaveURL('https://alizia.educabot.ai/login');
  });
});
