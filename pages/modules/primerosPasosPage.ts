import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { NavigationPage } from '../components/NavigationPage';

export class PrimerosPasosPage extends BasePage {
  readonly nav: NavigationPage;
  readonly heading: Locator;
  readonly valijaHeading: Locator;
  readonly exploraValijaText: Locator;
  readonly assistantAccessButton: Locator;
  readonly materialsAccessButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationPage(page);
    this.heading = page.getByRole('heading', { name: 'Primeros pasos', level: 1 });
    this.valijaHeading = page.getByRole('heading', { name: 'La valija', level: 2 });
    this.exploraValijaText = page.getByText('Explorá tu valija').filter({ visible: true });
    this.assistantAccessButton = page.getByRole('button', { name: 'Tu asistente de aula' });
    this.materialsAccessButton = page.getByRole('button', { name: 'Ir a Materiales' });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://alizia.educabot.ai/primeros-pasos');
  }
}
