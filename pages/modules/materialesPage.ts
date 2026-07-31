import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { NavigationPage } from '../components/NavigationPage';

export class MaterialesPage extends BasePage {
  readonly nav: NavigationPage;
  readonly heading: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationPage(page);
    this.heading = page.getByRole('heading', { name: 'Materiales', level: 1 });
    this.searchInput = page.getByRole('textbox', { name: 'Buscar material' });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://alizia.educabot.ai/materiales');
  }

  categoryFilterButton(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true });
  }

  categoryGroupHeading(name: string): Locator {
    return this.page.getByRole('heading', { name, level: 2 });
  }
}
