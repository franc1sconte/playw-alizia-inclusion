import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RecuperarContrasenaPage extends BasePage {
  readonly heading: Locator;
  readonly description: Locator;
  readonly emailInput: Locator;
  readonly sendLinkButton: Locator;
  readonly backToLoginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Restablecer contraseña' });
    this.description = page.getByText('Ingresá tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña').filter({ visible: true });
    this.emailInput = page.getByLabel('Correo electrónico').first();
    this.sendLinkButton = page.getByRole('button', { name: 'Enviar enlace' });
    this.backToLoginButton = page.getByRole('button', { name: 'Volver a Iniciar sesión' });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://alizia.educabot.ai/recuperar-contrasena');
  }

  async backToLogin(): Promise<void> {
    await this.backToLoginButton.click();
  }
}
