import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { NavigationPage } from '../components/NavigationPage';

export class RecursosPage extends BasePage {
  readonly nav: NavigationPage;
  readonly heading: Locator;
  readonly createButton: Locator;
  readonly searchInput: Locator;
  readonly groupTabs: Locator;
  readonly timeRangeGroup: Locator;
  readonly resourcesPanel: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationPage(page);
    this.heading = page.getByRole('heading', { name: 'Recursos pedagógicos', level: 1 });
    this.createButton = page.getByRole('button', { name: 'Crear nuevo recurso' });
    this.searchInput = page.getByRole('textbox', { name: 'Buscar recursos' });
    this.groupTabs = page.getByRole('tablist', { name: 'Agrupar recursos' });
    this.timeRangeGroup = page.getByRole('group', { name: 'Filtrar por rango de tiempo' });
    this.resourcesPanel = page.getByRole('tabpanel');
  }

  async goto(): Promise<void> {
    await this.page.goto('https://alizia.educabot.ai/recursos');
  }

  groupTab(name: string): Locator {
    return this.groupTabs.getByRole('tab', { name });
  }

  timeRangeButton(name: string): Locator {
    return this.timeRangeGroup.getByRole('button', { name });
  }
}
