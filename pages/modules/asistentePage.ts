import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { NavigationPage } from '../components/NavigationPage';

export class AsistentePage extends BasePage {
  readonly nav: NavigationPage;
  readonly greeting: Locator;
  readonly helpPrompt: Locator;
  readonly messageInput: Locator;
  readonly dictateButton: Locator;
  readonly sendButton: Locator;
  readonly historyHeading: Locator;
  readonly historySearchInput: Locator;
  readonly toolsAccessSection: Locator;
  readonly welcomeModal: Locator;
  readonly welcomeModalHeading: Locator;
  readonly welcomeModalContinueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationPage(page);
    this.greeting = page.getByText(/^Hola .+,$/);
    this.helpPrompt = page.getByText('¿Cómo puedo ayudarte?');
    this.messageInput = page.getByRole('textbox', { name: 'Mensaje para el asistente' });
    this.dictateButton = page.getByRole('button', { name: 'Dictar mensaje' });
    this.sendButton = page.getByRole('button', { name: 'Enviar mensaje' });
    this.historyHeading = page.getByRole('heading', { name: 'Historial' });
    this.historySearchInput = page.getByRole('textbox', { name: 'Buscar conversación' });
    this.toolsAccessSection = page.getByText('Accesos a tus herramientas').filter({ visible: true });
    this.welcomeModal = page.getByRole('dialog');
    this.welcomeModalHeading = this.welcomeModal.getByRole('heading', { name: 'Alizia inclusión' });
    this.welcomeModalContinueButton = this.welcomeModal.getByRole('button', { name: 'Continuar' });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://alizia.educabot.ai/asistente');
  }

  quickAccessButton(name: string): Locator {
    return this.page.getByRole('button', { name });
  }

  toolsAccessCard(fullName: string): Locator {
    return this.page.getByRole('link', { name: fullName, exact: true });
  }
}
