import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly credentialsError: Locator;
  readonly forgotPasswordButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Correo electrónico').first();
    this.passwordInput = page.getByLabel('Contraseña').first();
    this.submitButton = page.getByRole('button', { name: 'Iniciar sesión' });
    this.emailError = page.getByRole('alert').filter({ hasText: 'Ingresá tu correo electrónico' });
    this.passwordError = page.getByRole('alert').filter({ hasText: 'Ingresá tu contraseña.' });
    this.credentialsError = page.getByRole('alert').filter({ hasText: 'El correo electrónico o la contraseña son incorrectos' });
    this.forgotPasswordButton = page.getByRole('button', { name: 'Olvidé mi contraseña' });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://alizia.educabot.ai/login');
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await this.page.reload();
  }

  async fillEmail(value: string): Promise<void> {
    await this.emailInput.fill(value);
  }

  async fillPassword(value: string): Promise<void> {
    await this.passwordInput.fill(value);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillEmail(username);
    await this.fillPassword(password);
    await this.submit();
  }
}
